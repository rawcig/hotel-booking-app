import { Booking, bookings } from '@/constants/data';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const MyBooking = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  
  const currentBookings = bookings.filter(booking => booking.status === 'confirmed' || booking.status === 'pending');
  const pastBookings = bookings.filter(booking => booking.status === 'completed' || booking.status === 'cancelled');

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} className="bg-white rounded-2xl border-2 border-gray-200 mb-4 overflow-hidden">
      <View className="flex-row">
        <Image 
          source={{ uri: booking.image }} 
          className="w-24 h-24 rounded-l-2xl"
          resizeMode="cover"
        />
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold text-gray-800 flex-1"> 
              {booking.hotelName}
            </Text>
            <View className={`px-3 py-1 rounded-full ${
              booking.status === 'confirmed' ? 'bg-green-100' :
              booking.status === 'pending' ? 'bg-yellow-100' :
              booking.status === 'completed' ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <Text className={`text-xs font-medium ${
                booking.status === 'confirmed' ? 'text-green-700' :
                booking.status === 'pending' ? 'text-yellow-700' :
                booking.status === 'completed' ? 'text-blue-700' : 'text-red-700'
              }`}>
                {booking.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text className="text-gray-500 text-sm mb-2">{booking.location}</Text>
          
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600 text-sm">
              {booking.checkIn} - {booking.checkOut}
            </Text>
            <Text className="text-gray-600 text-sm">
              {booking.guests} guests • {booking.rooms} room
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-blue-600">
              ${booking.totalPrice}
            </Text>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
              <Text className="text-white font-medium text-sm">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-4">
          {/* Header */}
          <View className="pt-4 mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              My Bookings
            </Text>
            
            {/* Tab Buttons */}
            <View className="flex-row bg-gray-100 rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setSelectedTab('current')}
                className={`flex-1 py-3 rounded-lg ${
                  selectedTab === 'current' ? 'bg-white' : ''
                }`}
              >
                <Text className={`text-center font-medium ${
                  selectedTab === 'current' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  Current ({currentBookings.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setSelectedTab('past')}
                className={`flex-1 py-3 rounded-lg ${
                  selectedTab === 'past' ? 'bg-white' : ''
                }`}
              >
                <Text className={`text-center font-medium ${
                  selectedTab === 'past' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  Past ({pastBookings.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bookings List */}
          <View className="mb-20">
            {selectedTab === 'current' 
              ? currentBookings.map(renderBookingCard)
              : pastBookings.map(renderBookingCard)
            }
            
            {((selectedTab === 'current' && currentBookings.length === 0) ||
              (selectedTab === 'past' && pastBookings.length === 0)) && (
              <View className="items-center justify-center py-20">
                <Text className="text-gray-500 text-lg">No bookings found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default MyBooking;