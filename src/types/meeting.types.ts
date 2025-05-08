
export type MessageType = "user" | "ai";
export type MessageCategory = "task" | "definition" | "blocker" | "general";

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
  meeting_id?: string;
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
  meeting_id?: string;
  created_at?: string;
  due_date?: string;
  from_message_id?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in-progress' | 'completed';
  participants: string[];
  createdAt: Date;
  created_at?: string;
}

export interface MeetingContextType {
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
}
