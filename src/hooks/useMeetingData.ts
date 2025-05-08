
import { useState, useEffect } from 'react';
import { meetingService } from "@/services/meeting.service";
import { Message, Task, Meeting } from "@/types/meeting.types";
import { useToast } from "@/hooks/use-toast";

export function useMeetingData() {
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load active meeting on initialization (if one exists)
  useEffect(() => {
    const loadActiveMeeting = async () => {
      try {
        setIsLoading(true);
        // Get all meetings and find one that's in progress
        const meetings = await meetingService.getMeetings();
        const inProgressMeeting = meetings.find(m => m.status === 'in-progress');
        
        if (inProgressMeeting) {
          const meeting: Meeting = {
            id: inProgressMeeting.id,
            title: inProgressMeeting.title,
            description: inProgressMeeting.description,
            status: inProgressMeeting.status as 'planned' | 'in-progress' | 'completed',
            participants: inProgressMeeting.participants || [],
            createdAt: new Date(inProgressMeeting.created_at)
          };
          
          setActiveMeeting(meeting);
          
          // Load messages and tasks for this meeting
          await Promise.all([
            loadMessages(meeting.id),
            loadTasks(meeting.id)
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
      // Convert the messages to the expected type format
      const typedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        type: msg.type as Message["type"],
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        sender: msg.sender,
        category: msg.category as Message["category"],
        meeting_id: msg.meeting_id
      }));
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadTasks = async (meetingId: string) => {
    try {
      const tasksData = await meetingService.getTasks(meetingId);
      // Convert the tasks to the expected type format
      const typedTasks: Task[] = tasksData.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as Task["status"],
        assignee: task.assignee,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        fromMessageId: task.from_message_id,
        meeting_id: task.meeting_id,
        created_at: task.created_at,
        due_date: task.due_date,
        from_message_id: task.from_message_id
      }));
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  return {
    activeMeeting,
    setActiveMeeting,
    messages,
    setMessages,
    tasks,
    setTasks,
    isLoading,
    setIsLoading,
    loadMessages,
    loadTasks
  };
}
