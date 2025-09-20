// services/NotificationService.ts
// Service to handle push notifications for the hotel booking app

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any;
  private responseListener: any;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check if device supports notifications
  async isNotificationSupported(): Promise<boolean> {
    return Device.isDevice && 
           (Platform.OS === 'ios' || Platform.OS === 'android');
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    try {
      // Check if device supports notifications
      if (!(await this.isNotificationSupported())) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      // Check permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      // If permission denied, return null
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get Expo push token
      // Try to get projectId from different possible locations
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                       '155107b2-de37-49f7-a868-6fcec0bee4c3' ||
                       undefined;
      
      // If we don't have a projectId, log a warning but continue
      if (!projectId) {
        console.warn('No projectId found for push notifications. This is required for EAS builds. Using default behavior.');
      }
      
      // Try to get the Expo push token
      try {
        const token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;

        console.log('Expo Push Token:', token);
        return token;
      } catch (tokenError) {
        console.error('Error getting Expo push token:', tokenError);
        // Try without projectId as a fallback
        try {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log('Expo Push Token (fallback):', token);
          return token;
        } catch (fallbackError) {
          console.error('Error getting Expo push token (fallback):', fallbackError);
          return null;
        }
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Schedule a local notification
  async scheduleNotification(
    title: string,
    body: string,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          badge: 1,
        },
        trigger: trigger || null,
      });
      
      console.log('Notification scheduled with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Send an immediate notification
  async sendImmediateNotification(title: string, body: string) {
    return this.scheduleNotification(title, body);
  }

  // Send a booking confirmation notification
  async sendBookingConfirmation(
    hotelName: string,
    checkInDate: string,
    checkOutDate: string,
    bookingId: number,
    totalPrice: string
  ) {
    const title = 'Booking Confirmed!';
    const body = `Your stay at ${hotelName} from ${checkInDate} to ${checkOutDate} is confirmed. Total: ${totalPrice}. Booking ID: ${bookingId}`;
    
    return this.sendImmediateNotification(title, body);
  }

  // Send a check-in reminder
  async sendCheckInReminder(
    hotelName: string,
    checkInDate: string,
    daysUntilCheckIn: number
  ) {
    const title = 'Check-in Reminder';
    const body = `Your stay at ${hotelName} begins in ${daysUntilCheckIn} days on ${checkInDate}. Don't forget to pack!`;
    
    // Schedule for tomorrow at 10 AM
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + 1);
    trigger.setHours(10, 0, 0, 0);
    
    return this.scheduleNotification(title, body);
  }

  // Send a special offer notification
  async sendSpecialOffer(
    offerTitle: string,
    discount: string,
    expirationDate: string
  ) {
    const title = 'Special Offer!';
    const body = `${offerTitle} - ${discount} off! Offer expires ${expirationDate}`;
    
    return this.sendImmediateNotification(title, body);
  }

  // Send a booking cancellation notification
  async sendBookingCancellation(
    hotelName: string,
    checkInDate: string,
    bookingId: number
  ) {
    const title = 'Booking Cancelled';
    const body = `Your booking at ${hotelName} for ${checkInDate} has been successfully cancelled. Booking ID: ${bookingId}`;
    
    return this.sendImmediateNotification(title, body);
  }

  // Send a payment confirmation notification
  async sendPaymentConfirmation(
    hotelName: string,
    amount: string,
    paymentMethod: string
  ) {
    const title = 'Payment Confirmed';
    const body = `Your payment of ${amount} for ${hotelName} using ${paymentMethod} has been processed successfully.`;
    
    return this.sendImmediateNotification(title, body);
  }

  // Schedule a check-in reminder 24 hours before check-in
  async scheduleCheckInReminder(
    hotelName: string,
    checkInDate: string,
    bookingId: number
  ) {
    const title = 'Check-in Tomorrow';
    const body = `Don't forget! Your check-in at ${hotelName} is tomorrow. We look forward to welcoming you!`;
    
    // Parse check-in date and schedule for 24 hours before
    const checkIn = new Date(checkInDate);
    const reminderDate = new Date(checkIn.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
    
    return this.scheduleNotification(title, body);
  }

  // Schedule a check-out reminder
  async scheduleCheckOutReminder(
    hotelName: string,
    checkOutDate: string,
    bookingId: number
  ) {
    const title = 'Check-out Reminder';
    const body = `Your stay at ${hotelName} ends today. Please check out by 12:00 PM. Thank you for choosing us!`;
    
    // Parse check-out date and schedule for morning of check-out
    const checkOut = new Date(checkOutDate);
    checkOut.setHours(9, 0, 0, 0); // 9:00 AM
    
    return this.scheduleNotification(title, body);
  }

  // Set up notification listeners
  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ) {
    // Handle received notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    // Handle notification responses (taps)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );
  }

  // Clean up notification listeners
  removeNotificationListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

// Export singleton instance
export default NotificationService.getInstance();