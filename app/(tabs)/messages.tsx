import { messages } from '@/constants/data';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Messages = () => {
  const renderMessageItem = (message: any) => (
    <TouchableOpacity 
      key={message.id}
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => router.push(`/chat/${message.id}` as any)}
    >
      {/* Avatar */}
      <View className="relative mr-4">
        <Image 
          source={{ uri: message.avatar }} 
          className="w-12 h-12 rounded-full"
          resizeMode="cover"
        />
        {/* Online indicator for support */}
        {message.type === 'support' && (
          <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></View>
        )}
      </View>

      {/* Message Content */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-lg font-semibold text-gray-800">
            {message.hotelName}
          </Text>
          <Text className="text-sm text-gray-500">{message.time}</Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600 flex-1 mr-2" numberOfLines={1}>
            {message.lastMessage}
          </Text>
          {message.unread > 0 && (
            <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {message.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="p-4 border-b border-gray-100">
            <Text className="text-2xl font-bold text-gray-800">Messages</Text>
          </View>

          {/* Search Bar */}
          <View className="p-4">
            <View className="bg-gray-100 rounded-xl p-4 flex-row items-center">
              <Text className="text-gray-500 flex-1">Search conversations...</Text>
              <Text className="text-gray-400">🔍</Text>
            </View>
          </View>

          {/* Messages List */}
          <View className="flex-1">
            {messages.map(renderMessageItem)}
          </View>

          {/* Empty state if no messages */}
          {messages.length === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-500 text-lg mb-2">No messages yet</Text>
              <Text className="text-gray-400 text-center px-8">
                Your conversations with hotels and support will appear here
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button for New Message */}
        <TouchableOpacity 
          className="absolute bottom-[100px] right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0.5 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 3,
          }}
          onPress={() => alert('New message feature coming soon!')}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
export default Messages;