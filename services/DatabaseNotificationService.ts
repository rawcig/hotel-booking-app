// services/DatabaseNotificationService.ts
// Service to handle database notifications and convert them to push notifications

import { supabase } from '@/lib/supabase';
import NotificationService from '@/services/NotificationService';
import { analyticsService } from '@/services/analyticsService';

interface DatabaseNotification {
  id: number;
  guest_id: number;
  type: 'email' | 'sms';
  subject: string;
  message: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  updated_at: string;
}

class DatabaseNotificationService {
  private static instance: DatabaseNotificationService;
  private isProcessing: boolean = false;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): DatabaseNotificationService {
    if (!DatabaseNotificationService.instance) {
      DatabaseNotificationService.instance = new DatabaseNotificationService();
    }
    return DatabaseNotificationService.instance;
  }

  // Process pending notifications from database
  async processPendingNotifications() {
    if (this.isProcessing) {
      console.log('Already processing notifications, skipping...');
      return;
    }

    this.isProcessing = true;
    
    try {
      // Get pending notifications
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10); // Process up to 10 notifications at a time

      if (error) {
        console.error('Error fetching pending notifications:', error);
        analyticsService.logError({
          error: 'DatabaseError',
          message: `Failed to fetch pending notifications: ${error.message}`,
          component: 'DatabaseNotificationService.processPendingNotifications',
          severity: 'high'
        });
        return;
      }

      if (!notifications || notifications.length === 0) {
        console.log('No pending notifications to process');
        return;
      }

      console.log(`Processing ${notifications.length} pending notifications`);

      // Process each notification
      for (const notification of notifications) {
        await this.processNotification(notification);
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
      analyticsService.logError({
        error: 'ProcessingError',
        message: `Failed to process notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'DatabaseNotificationService.processPendingNotifications',
        severity: 'high'
      });
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a single notification
  private async processNotification(notification: DatabaseNotification) {
    try {
      console.log(`Processing notification ID: ${notification.id}`);
      
      // Send push notification
      const notificationId = await NotificationService.sendImmediateNotification(
        notification.subject,
        notification.message
      );

      if (notificationId) {
        // Update notification status to 'sent'
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        if (updateError) {
          console.error(`Error updating notification ${notification.id}:`, updateError);
          analyticsService.logError({
            error: 'DatabaseError',
            message: `Failed to update notification ${notification.id}: ${updateError.message}`,
            component: 'DatabaseNotificationService.processNotification',
            severity: 'medium',
            metadata: {
              notification_id: notification.id
            }
          });
        } else {
          console.log(`Successfully processed notification ID: ${notification.id}`);
          analyticsService.trackEvent({
            event: 'notification_sent',
            category: 'notifications',
            action: 'sent',
            metadata: {
              notification_id: notification.id,
              type: notification.type,
              subject: notification.subject
            }
          });
        }
      } else {
        // Update notification status to 'failed'
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        if (updateError) {
          console.error(`Error updating failed notification ${notification.id}:`, updateError);
          analyticsService.logError({
            error: 'DatabaseError',
            message: `Failed to update failed notification ${notification.id}: ${updateError.message}`,
            component: 'DatabaseNotificationService.processNotification',
            severity: 'medium',
            metadata: {
              notification_id: notification.id
            }
          });
        } else {
          console.log(`Marked notification ID: ${notification.id} as failed`);
          analyticsService.logError({
            error: 'NotificationError',
            message: `Failed to send notification ${notification.id}`,
            component: 'DatabaseNotificationService.processNotification',
            severity: 'medium',
            metadata: {
              notification_id: notification.id
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);
      analyticsService.logError({
        error: 'ProcessingError',
        message: `Failed to process notification ${notification.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'DatabaseNotificationService.processNotification',
        severity: 'high',
        metadata: {
          notification_id: notification.id
        }
      });
    }
  }

  // Schedule periodic notification processing
  startPeriodicProcessing(intervalMs: number = 30000) { // Default 30 seconds
    console.log(`Starting periodic notification processing every ${intervalMs}ms`);
    
    // Process immediately
    this.processPendingNotifications();
    
    // Schedule periodic processing
    setInterval(() => {
      this.processPendingNotifications();
    }, intervalMs);
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const { count: total, error: totalError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' });

      const { count: pending, error: pendingError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      const { count: sent, error: sentError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('status', 'sent');

      const { count: failed, error: failedError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('status', 'failed');

      if (totalError || pendingError || sentError || failedError) {
        const errors = [totalError, pendingError, sentError, failedError].filter(Boolean);
        throw new Error(`Failed to fetch notification stats: ${errors[0]?.message}`);
      }

      return {
        total: total || 0,
        pending: pending || 0,
        sent: sent || 0,
        failed: failed || 0
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      analyticsService.logError({
        error: 'DatabaseError',
        message: `Failed to fetch notification stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'DatabaseNotificationService.getNotificationStats',
        severity: 'medium'
      });
      return null;
    }
  }

  // Get recent notifications for a guest
  async getGuestNotifications(guestId: number, limit: number = 10) {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch guest notifications: ${error.message}`);
      }

      return notifications;
    } catch (error) {
      console.error(`Error fetching notifications for guest ${guestId}:`, error);
      analyticsService.logError({
        error: 'DatabaseError',
        message: `Failed to fetch guest notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'DatabaseNotificationService.getGuestNotifications',
        severity: 'medium',
        metadata: {
          guest_id: guestId
        }
      });
      return null;
    }
  }
}

// Export singleton instance
export default DatabaseNotificationService.getInstance();