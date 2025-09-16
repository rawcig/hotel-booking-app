// components/NotificationIcon.tsx
// Component to display notification icon with badge

import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNotifications } from '@/context/NotificationContext';

interface NotificationIconProps {
  onPress: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ onPress }) => {
  const { notification } = useNotifications();
  
  // For demo purposes, we'll show a badge when there's a recent notification
  const hasUnread = !!notification;
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="relative w-10 h-10 items-center justify-center"
    >
      <View className="w-8 h-8 items-center justify-center">
        <Text className="text-xl">🔔</Text>
      </View>
      
      {hasUnread && (
        <View className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
          <Text className="text-white text-xs font-bold">1</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationIcon;