import { Booking, bookings, hotels } from '@/constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function BookingForm() {
  const { hotelId } = useLocalSearchParams();
  const hotel = hotels[Number(hotelId)];
  
  // Date picker states
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days later
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  
  // Form states
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  
  // Calculate nights between dates
  const calculateNights = () => {
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 1;
  };

  // Calculate total price
  const calculateTotal = () => {
    const nights = calculateNights();
    return Number(hotel.price) * nights * Number(rooms);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Handle date changes
  const onCheckInChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowCheckInPicker(false);
    }
    if (selectedDate) {
      setCheckInDate(selectedDate);
      // If check-out is before check-in, adjust it
      if (selectedDate >= checkOutDate) {
        setCheckOutDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  };

  const onCheckOutChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false);
    }
    if (selectedDate && selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
    }
  };

  // Save booking function
  const saveBooking = async () => {
    // Validate form
    if (!guestName.trim()) {
      Alert.alert('Error', 'Please enter guest name');
      return;
    }
    if (!guestEmail.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return;
    }
    if (!guestPhone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    try {
      // Create new booking
      const newBooking: Booking = {
        id: Date.now(), // Simple ID generation
        hotelName: hotel.name,
        location: hotel.location,
        image: hotel.image,
        checkIn: formatDate(checkInDate),
        checkOut: formatDate(checkOutDate),
        guests: Number(guests),
        rooms: Number(rooms),
        totalPrice: calculateTotal().toString(),
        status: 'confirmed',
        bookingDate: new Date().toLocaleDateString(),
        guestName,
        guestEmail,
        guestPhone
      };

      // Get existing bookings from AsyncStorage
      const existingBookingsJson = await AsyncStorage.getItem('bookings');
      const existingBookings = existingBookingsJson ? JSON.parse(existingBookingsJson) : bookings;
      
      // Add new booking
      const updatedBookings = [...existingBookings, newBooking];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      Alert.alert(
        'Booking Confirmed!', 
        `Your booking at ${hotel.name} has been confirmed.`,
        [
          {
            text: 'View Bookings',
            onPress: () => router.push('/(tabs)/my_booking')
          },
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    }
  };

  // iOS DatePicker Modal Component
  const DatePickerModal = ({ 
    visible, 
    onClose, 
    date, 
    onChange, 
    minimumDate 
  }: {
    visible: boolean;
    onClose: () => void;
    date: Date;
    onChange: (event: any, selectedDate?: Date) => void;
    minimumDate?: Date;
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-4 w-80 shadow-lg">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 text-lg font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 text-lg font-medium">Done</Text>
            </TouchableOpacity>
          </View>
          <View className="p-4">
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={onChange}
              minimumDate={minimumDate}
              style={{ height: 180, width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

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

          {/* Guest Information */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Guest Information</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Full Name *</Text>
              <TextInput
                value={guestName}
                onChangeText={setGuestName}
                className="bg-gray-100 rounded-xl p-4 text-gray-800"
                placeholder="Enter your full name"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Email Address *</Text>
              <TextInput
                value={guestEmail}
                onChangeText={setGuestEmail}
                className="bg-gray-100 rounded-xl p-4 text-gray-800"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Phone Number *</Text>
              <TextInput
                value={guestPhone}
                onChangeText={setGuestPhone}
                className="bg-gray-100 rounded-xl p-4 text-gray-800"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Booking Details */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Booking Details</Text>
            
            {/* Check-in Date */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Check-in Date</Text>
              <TouchableOpacity
                onPress={() => setShowCheckInPicker(true)}
                className="bg-gray-100 rounded-xl p-4 flex-row justify-between items-center"
              >
                <Text className="text-gray-800 text-base flex-1" numberOfLines={1}>
                  {formatDate(checkInDate)}
                </Text>
                <Text className="text-gray-400 ml-2">📅</Text>
              </TouchableOpacity>
            </View>

           {/* Check-out Date */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Check-out Date</Text>
              <TouchableOpacity
                onPress={() => setShowCheckOutPicker(true)}
                className="bg-gray-100 rounded-xl p-4 flex-row justify-between items-center"
              >
                <Text className="text-gray-800 text-base flex-1" numberOfLines={1}>
                  {formatDate(checkOutDate)}
                </Text>
                <Text className="text-gray-400 ml-2">📅</Text>
              </TouchableOpacity>
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
            <Text className="text-gray-600 text-sm">
              {calculateNights()} night{calculateNights() > 1 ? 's' : ''} • {rooms} room{Number(rooms) > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity 
            className="bg-blue-500 py-4 rounded-xl mb-8"
            onPress={saveBooking}
          >
            <Text className="text-white text-center text-lg font-semibold">Confirm Booking</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Date Pickers */}
        {Platform.OS === 'ios' ? (
          <>
            <DatePickerModal
              visible={showCheckInPicker}
              onClose={() => setShowCheckInPicker(false)}
              date={checkInDate}
              onChange={onCheckInChange}
              minimumDate={new Date()}
            />
            <DatePickerModal
              visible={showCheckOutPicker}
              onClose={() => setShowCheckOutPicker(false)}
              date={checkOutDate}
              onChange={onCheckOutChange}
              minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
            />
          </>
        ) : (
          <>
            {showCheckInPicker && (
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display="default"
                onChange={onCheckInChange}
                minimumDate={new Date()}
              />
            )}
            {showCheckOutPicker && (
              <DateTimePicker
                value={checkOutDate}
                mode="date"
                display="default"
                onChange={onCheckOutChange}
                minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
              />
            )}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}