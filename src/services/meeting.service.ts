
import { supabase } from '@/lib/supabase';
import { Message, Task } from '@/contexts/MeetingContext';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMeetingDTO {
  title: string;
  description?: string;
  participants: string[];
}

export interface UpdateMeetingDTO {
  id: string;
  title?: string;
  description?: string;
  status?: 'planned' | 'in-progress' | 'completed';
  participants?: string[];
}

export const meetingService = {
  async createMeeting({ title, description, participants }: CreateMeetingDTO) {
    const { data, error } = await supabase
      .from('meetings')
      .insert([
        {
          id: uuidv4(),
          title,
          description,
          participants,
          status: 'planned',
          created_at: new Date().toISOString(),
        },
      ])
      .select('*');

    if (error) throw error;
    return data?.[0];
  },

  async updateMeeting({ id, ...updateData }: UpdateMeetingDTO) {
    const { data, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .select('*');

    if (error) throw error;
    return data?.[0];
  },

  async getMeetings() {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMeeting(id: string) {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addMessage(meetingId: string, message: Omit<Message, 'id' | 'timestamp'>) {
    const newMessage = {
      id: uuidv4(),
      meeting_id: meetingId,
      type: message.type,
      content: message.content,
      timestamp: new Date().toISOString(),
      sender: message.sender ? JSON.stringify(message.sender) : null,
      category: message.category || null,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([newMessage])
      .select('*');

    if (error) throw error;
    return data?.[0];
  },

  async getMessages(meetingId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return data.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
      sender: msg.sender ? JSON.parse(msg.sender) : undefined,
    }));
  },

  async addTask(meetingId: string, task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask = {
      id: uuidv4(),
      meeting_id: meetingId,
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee ? JSON.stringify(task.assignee) : null,
      due_date: task.dueDate ? task.dueDate.toISOString() : null,
      created_at: new Date().toISOString(),
      from_message_id: task.fromMessageId || null,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select('*');

    if (error) throw error;
    return data?.[0];
  },

  async getTasks(meetingId?: string) {
    let query = supabase
      .from('tasks')
      .select('*');
      
    if (meetingId) {
      query = query.eq('meeting_id', meetingId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(task => ({
      ...task,
      createdAt: new Date(task.created_at),
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      assignee: task.assignee ? JSON.parse(task.assignee) : undefined,
    }));
  },

  async updateTaskStatus(taskId: string, status: Task['status']) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select('*');

    if (error) throw error;
    return data?.[0];
  },
};
