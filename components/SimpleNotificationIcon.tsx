// components/SimpleNotificationIcon.tsx
// Simple notification icon component for the header

import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface SimpleNotificationIconProps {
  onPress: () => void;
  hasUnread?: boolean;
}

const SimpleNotificationIcon: React.FC<SimpleNotificationIconProps> = ({ 
  onPress, 
  hasUnread = false 
}) => {
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

export default SimpleNotificationIcon;