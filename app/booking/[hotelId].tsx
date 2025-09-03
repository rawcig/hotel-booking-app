import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { hotels } from '@/constants/data';

export default function BookingForm() {
  const { hotelId } = useLocalSearchParams();
  const hotel = hotels[Number(hotelId)];
  
  const [checkIn, setCheckIn] = useState('2025-09-15');
  const [checkOut, setCheckOut] = useState('2025-09-18');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');

  const calculateTotal = () => {
    const nights = 3; // We'll calculate this properly later
    return Number(hotel.price) * nights * Number(rooms);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-4">
          {/* Header */}
          <View className="flex-row items-center pt-4 mb-6">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
            >
              <Text className="text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Book Hotel</Text>
          </View>

          {/* Hotel Info */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-bold text-gray-800">{hotel.name}</Text>
            <Text className="text-gray-600">{hotel.location}</Text>
            <Text className="text-blue-600 font-bold">${hotel.price}/night</Text>
          </View>

          {/* Booking Form */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Booking Details</Text>
            
            {/* Check-in Date */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Check-in Date</Text>
              <TextInput
                value={checkIn}
                onChangeText={setCheckIn}
                className="bg-gray-100 rounded-xl p-4 text-gray-800"
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Check-out Date */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Check-out Date</Text>
              <TextInput
                value={checkOut}
                onChangeText={setCheckOut}
                className="bg-gray-100 rounded-xl p-4 text-gray-800"
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Guests & Rooms */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2">Guests</Text>
                <TextInput
                  value={guests}
                  onChangeText={setGuests}
                  className="bg-gray-100 rounded-xl p-4 text-gray-800"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 mb-2">Rooms</Text>
                <TextInput
                  value={rooms}
                  onChangeText={setRooms}
                  className="bg-gray-100 rounded-xl p-4 text-gray-800"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Total Price */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">Total</Text>
              <Text className="text-2xl font-bold text-blue-600">${calculateTotal()}</Text>
            </View>
            <Text className="text-gray-600 text-sm">3 nights • {rooms} room(s)</Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity 
            className="bg-blue-500 py-4 rounded-xl mb-8"
            onPress={() => {
              // We'll add booking logic here
              alert('Booking confirmed!');
              router.push('/(tabs)/my_booking');
            }}
          >
            <Text className="text-white text-center text-lg font-semibold">Confirm Booking</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}