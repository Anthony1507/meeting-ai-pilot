
import { useState } from 'react';
import { meetingService } from "@/services/meeting.service";
import { aiService } from "@/services/ai.service";
import { Message, Task, MessageCategory, Meeting } from "@/types/meeting.types";
import { useToast } from "@/hooks/use-toast";

interface MeetingOperationsProps {
  activeMeeting: Meeting | null;
  setActiveMeeting: (meeting: Meeting | null) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  setIsLoading: (isLoading: boolean) => void;
  loadMessages: (meetingId: string) => Promise<void>;
  loadTasks: (meetingId: string) => Promise<void>;
}

export function useMeetingOperations({
  activeMeeting,
  setActiveMeeting,
  messages,
  setMessages,
  tasks,
  setTasks,
  setIsLoading,
  loadMessages,
  loadTasks
}: MeetingOperationsProps) {
  const [activeFilter, setActiveFilter] = useState<MessageCategory | undefined>(undefined);
  const { toast } = useToast();

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
      
      if (newMessage) {
        // Convert the message to our internal format
        const formattedMessage: Message = {
          id: newMessage.id,
          type: newMessage.type as Message["type"],
          content: newMessage.content,
          timestamp: new Date(newMessage.timestamp),
          sender: newMessage.sender ? JSON.parse(newMessage.sender as string) : undefined,
          category: newMessage.category as MessageCategory | undefined,
        };
        
        setMessages((prev: Message[]) => [...prev, formattedMessage]);
  
        // If it's a user message, analyze it with AI to detect tasks, etc.
        if (message.type === "user") {
          try {
            const detectionResult = await aiService.detectTasksAndDefinitions({
              text: message.content,
            });
            
            // Add the AI response
            const aiResponse = {
              type: "ai" as Message["type"],
              content: detectionResult.response,
              category: detectionResult.category as MessageCategory | undefined,
            };
            
            await addMessage(aiResponse);
            
            // If tasks were detected, add them
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
      
      if (newTask) {
        // Convert the task to our internal format
        const formattedTask: Task = {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status as Task["status"],
          assignee: newTask.assignee ? JSON.parse(newTask.assignee as string) : undefined,
          dueDate: newTask.due_date ? new Date(newTask.due_date) : undefined,
          createdAt: new Date(newTask.created_at),
          fromMessageId: newTask.from_message_id,
        };
        
        setTasks((prev: Task[]) => [...prev, formattedTask]);
        
        toast({
          title: "Tarea creada",
          description: `"${task.title}" ha sido añadida a la lista.`,
        });
      }
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
      
      setTasks((prev: Task[]) =>
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
      
      if (newMeeting) {
        // Update meeting status to 'in-progress'
        const updatedMeeting = await meetingService.updateMeeting({
          id: newMeeting.id,
          status: 'in-progress',
        });
        
        if (updatedMeeting) {
          setActiveMeeting({
            id: updatedMeeting.id,
            title: updatedMeeting.title,
            description: updatedMeeting.description,
            status: updatedMeeting.status as 'planned' | 'in-progress' | 'completed',
            participants: updatedMeeting.participants || [],
            createdAt: new Date(updatedMeeting.created_at),
          });
          
          // Clear previous messages and tasks
          setMessages([]);
          setTasks([]);
          
          toast({
            title: "Reunión iniciada",
            description: `"${title}" ha iniciado correctamente.`,
          });
        }
      }
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

  return {
    activeFilter,
    setActiveFilter,
    addMessage,
    addTask,
    updateTaskStatus,
    startMeeting,
    endMeeting,
    filteredMessages,
  };
}
