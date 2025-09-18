// context/NotificationContext.tsx
// Context to manage notification state and permissions

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NotificationService from '@/services/NotificationService';
import DatabaseNotificationService from '@/services/DatabaseNotificationService';
import * as Notifications from 'expo-notifications';

// Define context type
interface NotificationContextType {
  notificationToken: string | null;
  notification: Notifications.Notification | undefined;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  processDatabaseNotifications: () => Promise<void>;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [hasPermission, setHasPermission] = useState(false);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      const token = await NotificationService.registerForPushNotificationsAsync();
      if (token) {
        setNotificationToken(token);
        setHasPermission(true);
        return true;
      } else {
        setHasPermission(false);
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setHasPermission(false);
      return false;
    }
  };

  // Send a test notification
  const sendTestNotification = async () => {
    await NotificationService.sendImmediateNotification(
      'Test Notification',
      'This is a test notification from your Hotel Booking App!'
    );
  };

  // Process database notifications
  const processDatabaseNotifications = async () => {
    await DatabaseNotificationService.processPendingNotifications();
  };

  // Set up notification listeners
  useEffect(() => {
    // Set up notification listeners
    NotificationService.setupNotificationListeners(
      (notification) => {
        setNotification(notification);
        console.log('Received notification:', notification);
      },
      (response) => {
        console.log('User tapped notification:', response);
      }
    );

    // Start periodic database notification processing
    DatabaseNotificationService.startPeriodicProcessing(60000); // Process every minute

    // Clean up listeners on unmount
    return () => {
      NotificationService.removeNotificationListeners();
    };
  }, []);

  // Request permission on app start
  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notificationToken,
        notification,
        hasPermission,
        requestPermission,
        sendTestNotification,
        processDatabaseNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};