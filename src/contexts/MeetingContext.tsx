
import React, { createContext, useContext, useState } from "react";

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

type MeetingContextType = {
  messages: Message[];
  tasks: Task[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
  filteredMessages: (category?: MessageCategory) => Message[];
  activeFilter: MessageCategory | undefined;
  setActiveFilter: React.Dispatch<React.SetStateAction<MessageCategory | undefined>>;
};

// Sample data
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    type: "user",
    content: "Buenos días equipo, vamos a comenzar la reunión diaria",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    sender: {
      id: "3",
      name: "Laura Gómez",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  },
  {
    id: "2",
    type: "user",
    content: "Estuve trabajando en la integración de la API y tengo algunas preguntas sobre la documentación",
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    sender: {
      id: "1",
      name: "Ana Martínez",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "3",
    type: "ai",
    content: "He detectado una pregunta sobre documentación de la API. ¿Puedo ayudar a resolver alguna duda específica sobre los endpoints o autenticación?",
    timestamp: new Date(Date.now() - 1000 * 60 * 54),
    category: "general",
  },
  {
    id: "4",
    type: "user",
    content: "Sí, no entiendo bien cómo autenticar las peticiones hacia el servicio de pagos",
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
    sender: {
      id: "1",
      name: "Ana Martínez",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "5",
    type: "ai",
    content: "Basado en nuestra documentación, para autenticar con el servicio de pagos necesitas usar OAuth 2.0. Sugiero crear una tarea para implementar este proceso, con los siguientes pasos: 1) Registrar la aplicación en el portal de desarrolladores, 2) Implementar el flujo de authorization code, 3) Manejar token refresh. ¿Quieres que cree esta tarea?",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    category: "task",
  },
  {
    id: "6",
    type: "user",
    content: "Sí, por favor crea la tarea y asígnamela",
    timestamp: new Date(Date.now() - 1000 * 60 * 40),
    sender: {
      id: "1",
      name: "Ana Martínez",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "7",
    type: "ai",
    content: "He creado la tarea 'Implementar OAuth 2.0 para servicio de pagos' y la he asignado a Ana Martínez con fecha límite para el próximo sprint.",
    timestamp: new Date(Date.now() - 1000 * 60 * 39),
    category: "task",
  },
  {
    id: "8",
    type: "user",
    content: "Yo estoy trabajando en las nuevas maquetas del dashboard pero estoy bloqueado porque necesito definiciones claras sobre las métricas principales que debemos mostrar",
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    sender: {
      id: "2",
      name: "Carlos Rodríguez",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
  {
    id: "9",
    type: "ai",
    content: "Detecto un posible bloqueante. Carlos necesita definiciones claras sobre métricas para el dashboard. Según la documentación de requisitos del sprint actual, las métricas principales deberían ser: tasa de conversión, ingresos mensuales, usuarios activos y tiempo medio de sesión. ¿Esto resuelve tu duda o necesitas más clarificación?",
    timestamp: new Date(Date.now() - 1000 * 60 * 34),
    category: "blocker",
  },
  {
    id: "10",
    type: "user",
    content: "Eso me ayuda, pero necesitaría saber si debo diseñar gráficos comparativos o solo valores absolutos",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    sender: {
      id: "2",
      name: "Carlos Rodríguez",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
  {
    id: "11",
    type: "user",
    content: "Según lo que hablamos con el cliente, necesitamos ambos tipos de visualización. Valores absolutos para métricas puntuales y gráficos comparativos para evolución temporal.",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    sender: {
      id: "3",
      name: "Laura Gómez",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  },
  {
    id: "12",
    type: "ai",
    content: "Resumiendo esta definición: El dashboard debe incluir tanto valores absolutos para métricas puntuales como gráficos comparativos para evolución temporal de: tasa de conversión, ingresos mensuales, usuarios activos y tiempo medio de sesión.",
    timestamp: new Date(Date.now() - 1000 * 60 * 24),
    category: "definition",
  },
  {
    id: "13",
    type: "user",
    content: "¿Podemos repasar los objetivos pendientes para este sprint?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    sender: {
      id: "3",
      name: "Laura Gómez",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  },
  {
    id: "14",
    type: "ai",
    content: "Claro, los objetivos pendientes para este sprint son:\n\n1. Finalizar integración de API de pagos (Responsable: Ana)\n2. Completar maquetas de dashboard con métricas definidas (Responsable: Carlos)\n3. Implementar sistema de notificaciones (Pendiente de asignación)\n4. Realizar pruebas de rendimiento (Pendiente de asignación)\n\nEl sprint finaliza en 8 días. Según mi análisis, hay riesgo de no completar el objetivo 3 debido a la falta de asignación.",
    timestamp: new Date(Date.now() - 1000 * 60 * 14),
    category: "general",
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Implementar OAuth 2.0 para servicio de pagos",
    description: "Integrar el sistema de autenticación OAuth 2.0 con el servicio de pagos incluyendo: registro de aplicación, authorization code flow y token refresh.",
    status: "in-progress",
    assignee: {
      id: "1",
      name: "Ana Martínez",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    createdAt: new Date(Date.now() - 1000 * 60 * 39),
    fromMessageId: "7",
  },
  {
    id: "task-2",
    title: "Completar maquetas del dashboard",
    description: "Diseñar visualizaciones para mostrar tasa de conversión, ingresos mensuales, usuarios activos y tiempo medio de sesión. Incluir tanto valores absolutos como gráficos comparativos.",
    status: "pending",
    assignee: {
      id: "2",
      name: "Carlos Rodríguez",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "task-3",
    title: "Implementar sistema de notificaciones",
    description: "Crear servicio de notificaciones en tiempo real para alertas y mensajes del sistema",
    status: "pending",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "task-4",
    title: "Realizar pruebas de rendimiento",
    description: "Ejecutar tests de carga y estrés para validar la capacidad del sistema",
    status: "pending",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "task-5",
    title: "Actualizar documentación de API",
    description: "Revisar y actualizar la documentación de la API para incluir los nuevos endpoints",
    status: "completed",
    assignee: {
      id: "1",
      name: "Ana Martínez",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  }
];

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState<MessageCategory | undefined>(undefined);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage = {
      ...message,
      id: `message-${Date.now()}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    
    // Simulate AI response after user message
    if (message.type === "user") {
      setTimeout(() => {
        const aiResponse = {
          id: `message-${Date.now() + 1}`,
          type: "ai" as MessageType,
          content: "He registrado tu mensaje. ¿Hay algo específico en lo que pueda ayudarte con respecto a esta reunión?",
          timestamp: new Date(),
          category: "general" as MessageCategory,
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTaskStatus = (taskId: string, status: Task["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
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
        messages,
        tasks,
        addMessage,
        addTask,
        updateTaskStatus,
        filteredMessages,
        activeFilter,
        setActiveFilter,
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
