import React, { createContext, useContext, useState, useEffect } from "react";
import { meetingService } from "@/services/meeting.service";
import { aiService } from "@/services/ai.service";
import { useToast } from "@/hooks/use-toast";

type MessageType = "user" | "ai";
type MessageCategory = "task" | "definition" | "blocker" | "general";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  category?: MessageCategory;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate?: Date;
  createdAt: Date;
  fromMessageId?: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in-progress' | 'completed';
  participants: string[];
  createdAt: Date;
}

type MeetingContextType = {
  activeMeeting: Meeting | null;
  messages: Message[];
  tasks: Task[];
  isLoading: boolean;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>;
  filteredMessages: (category?: MessageCategory) => Message[];
  activeFilter: MessageCategory | undefined;
  setActiveFilter: React.Dispatch<React.SetStateAction<MessageCategory | undefined>>;
  startMeeting: (title: string, description?: string, participants?: string[]) => Promise<void>;
  endMeeting: () => Promise<void>;
};

// Valores temporales - Serán reemplazados con datos reales de la base de datos
const INITIAL_MESSAGES: Message[] = [];
const INITIAL_TASKS: Task[] = [];

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MessageCategory | undefined>(undefined);
  const { toast } = useToast();

  // Cargar la reunión activa al inicio (si existe)
  useEffect(() => {
    const loadActiveMeeting = async () => {
      try {
        setIsLoading(true);
        // Este sería un endpoint específico que obtendría la reunión activa
        // Por ahora usamos la primera reunión en progreso
        const meetings = await meetingService.getMeetings();
        const inProgressMeeting = meetings.find(m => m.status === 'in-progress');
        
        if (inProgressMeeting) {
          setActiveMeeting({
            ...inProgressMeeting,
            createdAt: new Date(inProgressMeeting.created_at)
          });
          
          // Cargar mensajes y tareas
          await Promise.all([
            loadMessages(inProgressMeeting.id),
            loadTasks(inProgressMeeting.id)
          ]);
        }
      } catch (error) {
        console.error('Error loading active meeting:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la reunión activa.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadActiveMeeting();
  }, []);

  const loadMessages = async (meetingId: string) => {
    try {
      const messagesData = await meetingService.getMessages(meetingId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadTasks = async (meetingId: string) => {
    try {
      const tasksData = await meetingService.getTasks(meetingId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addMessage = async (message: Omit<Message, "id" | "timestamp">) => {
    if (!activeMeeting) {
      toast({
        title: "Error",
        description: "No hay una reunión activa.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newMessage = await meetingService.addMessage(activeMeeting.id, message);
      
      // Convertir el mensaje para nuestro formato interno
      const formattedMessage: Message = {
        id: newMessage.id,
        type: newMessage.type as MessageType,
        content: newMessage.content,
        timestamp: new Date(newMessage.timestamp),
        sender: newMessage.sender ? JSON.parse(newMessage.sender) : undefined,
        category: newMessage.category as MessageCategory | undefined,
      };
      
      setMessages((prev) => [...prev, formattedMessage]);

      // Si es un mensaje de usuario, analizarlo con IA para detectar tareas, etc.
      if (message.type === "user") {
        try {
          const detectionResult = await aiService.detectTasksAndDefinitions({
            text: message.content,
          });
          
          // Añadir la respuesta de IA
          const aiResponse = {
            type: "ai" as MessageType,
            content: detectionResult.response,
            category: detectionResult.category as MessageCategory | undefined,
          };
          
          await addMessage(aiResponse);
          
          // Si se detectaron tareas, añadirlas
          if (detectionResult.tasks && detectionResult.tasks.length > 0) {
            for (const taskData of detectionResult.tasks) {
              await addTask({
                title: taskData.title,
                description: taskData.description || "",
                status: "pending",
                assignee: taskData.assignee,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
                fromMessageId: formattedMessage.id,
              });
            }
          }
        } catch (error) {
          console.error('Error processing message with AI:', error);
        }
      }
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    if (!activeMeeting) {
      toast({
        title: "Error",
        description: "No hay una reunión activa.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newTask = await meetingService.addTask(activeMeeting.id, task);
      
      // Convertir la tarea a nuestro formato interno
      const formattedTask: Task = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status as Task["status"],
        assignee: newTask.assignee ? JSON.parse(newTask.assignee) : undefined,
        dueDate: newTask.due_date ? new Date(newTask.due_date) : undefined,
        createdAt: new Date(newTask.created_at),
        fromMessageId: newTask.from_message_id,
      };
      
      setTasks((prev) => [...prev, formattedTask]);
      
      toast({
        title: "Tarea creada",
        description: `"${task.title}" ha sido añadida a la lista.`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      setIsLoading(true);
      await meetingService.updateTaskStatus(taskId, status);
      
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status } : task
        )
      );
      
      toast({
        title: "Tarea actualizada",
        description: `El estado ha sido actualizado a "${
          status === 'pending' ? 'Pendiente' :
          status === 'in-progress' ? 'En progreso' : 'Completada'
        }"`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startMeeting = async (title: string, description?: string, participants: string[] = []) => {
    try {
      setIsLoading(true);
      const newMeeting = await meetingService.createMeeting({
        title,
        description,
        participants,
      });
      
      // Actualizar estado de la reunión a 'in-progress'
      const updatedMeeting = await meetingService.updateMeeting({
        id: newMeeting.id,
        status: 'in-progress',
      });
      
      setActiveMeeting({
        ...updatedMeeting,
        createdAt: new Date(updatedMeeting.created_at),
      });
      
      // Limpiar mensajes y tareas anteriores
      setMessages([]);
      setTasks([]);
      
      toast({
        title: "Reunión iniciada",
        description: `"${title}" ha iniciado correctamente.",
      });
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la reunión.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endMeeting = async () => {
    if (!activeMeeting) {
      return;
    }

    try {
      setIsLoading(true);
      await meetingService.updateMeeting({
        id: activeMeeting.id,
        status: 'completed',
      });
      
      // Generate meeting summary with AI
      const messageHistory = messages.map(msg => ({
        role: msg.type === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));
      
      const summary = await aiService.generateMeetingSummary({
        messages: messageHistory,
      });
      
      // Save the summary as a special message
      await meetingService.addMessage(activeMeeting.id, {
        type: 'ai',
        content: summary.summary,
        category: 'general',
      });
      
      setActiveMeeting(null);
      
      toast({
        title: "Reunión finalizada",
        description: "La reunión ha terminado y se ha generado un resumen.",
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
      toast({
        title: "Error",
        description: "No se pudo finalizar la reunión.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = (category?: MessageCategory) => {
    if (!category) {
      return messages;
    }
    return messages.filter((message) => message.category === category);
  };

  return (
    <MeetingContext.Provider
      value={{
        activeMeeting,
        messages,
        tasks,
        isLoading,
        addMessage,
        addTask,
        updateTaskStatus,
        filteredMessages,
        activeFilter,
        setActiveFilter,
        startMeeting,
        endMeeting,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
};
