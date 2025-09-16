// components/TestNotificationsButton.tsx
// Component to test notifications from within the app

import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import NotificationService from '@/services/NotificationService';

const TestNotificationsButton: React.FC = () => {
  const sendTestNotification = async () => {
    try {
      await NotificationService.sendImmediateNotification(
        'Test Notification',
        'This is a test notification from your Hotel Booking App!'
      );
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <TouchableOpacity 
      onPress={sendTestNotification}
      className="bg-blue-500 py-3 px-4 rounded-lg mt-4"
    >
      <Text className="text-white text-center font-medium">Send Test Notification</Text>
    </TouchableOpacity>
  );
};

export default TestNotificationsButton;