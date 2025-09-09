// api/services/notifications.ts
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: number;
  guest_id: number;
  type: 'email' | 'sms';
  subject: string | null;
  message: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export const notificationsService = {
  // Send a notification to a user
  sendNotification: async (
    guest_id: number,
    type: 'email' | 'sms',
    message: string,
    subject?: string
  ): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          guest_id,
          type,
          message,
          subject: subject || null,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // In a real app, you would actually send the notification here
    // For now, we'll just mark it as sent
    const { data: updatedData, error: updateError } = await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return updatedData as Notification;
  },

  // Get notifications for a user
  getUserNotifications: async (guest_id: number): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('guest_id', guest_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(error.message);
    }

    return data as Notification[];
  },

  // Mark notification as read
  markAsRead: async (id: number): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'sent' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Notification not found');
    }

    return data as Notification;
  },
};