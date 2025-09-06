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

  // Compact date format - fixed text overflow
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  // Quick date selection
  const setQuickDate = (nights: number) => {
    const newCheckIn = new Date();
    const newCheckOut = new Date(newCheckIn.getTime() + nights * 24 * 60 * 60 * 1000);
    setCheckInDate(newCheckIn);
    setCheckOutDate(newCheckOut);
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
      console.error('Booking save error:', error);
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    }
  };

  // iOS DatePicker Modal Component
  const DatePickerModal = ({ 
    visible, 
    onClose, 
    date, 
    onChange, 
    minimumDate,
    title = "Select Date"
  }: {
    visible: boolean;
    onClose: () => void;
    date: Date;
    onChange: (event: any, selectedDate?: Date) => void;
    minimumDate?: Date;
    title?: string;
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl mx-4 shadow-2xl w-180"
        >
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-red-500 text-base font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 text-base font-medium">Done</Text>
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
        </TouchableOpacity>
      </TouchableOpacity>
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

          {/* Improved Booking Details */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Booking Details</Text>
            
            {/* Date Container */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              {/* Check-in Date */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-600 mb-2">Check-in</Text>
                <TouchableOpacity
                  onPress={() => setShowCheckInPicker(true)}
                  className="bg-white rounded-lg px-4 py-3 flex-row items-center justify-between border border-gray-200"
                >
                  <View className="flex-1">
                    <Text className="text-gray-800 text-base font-medium">
                      {formatDate(checkInDate)}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {checkInDate.toLocaleDateString('en-US', { weekday: 'long' })}
                    </Text>
                  </View>
                  <Text className="text-blue-500 text-lg ml-2">📅</Text>
                </TouchableOpacity>
              </View>

              {/* Night separator */}
              <View className="flex-row items-center justify-center mb-3">
                <View className="flex-1 h-px bg-gray-300" />
                <View className="px-3 py-1 bg-blue-100 rounded-full mx-2">
                  <Text className="text-blue-600 text-xs font-medium">
                    {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                  </Text>
                </View>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Check-out Date */}
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-2">Check-out</Text>
                <TouchableOpacity
                  onPress={() => setShowCheckOutPicker(true)}
                  className="bg-white rounded-lg px-4 py-3 flex-row items-center justify-between border border-gray-200"
                >
                  <View className="flex-1">
                    <Text className="text-gray-800 text-base font-medium">
                      {formatDate(checkOutDate)}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {checkOutDate.toLocaleDateString('en-US', { weekday: 'long' })}
                    </Text>
                  </View>
                  <Text className="text-blue-500 text-lg ml-2">📅</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Select */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">Quick Select</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => setQuickDate(1)}
                    className="bg-blue-100 px-3 py-2 rounded-full mr-2"
                  >
                    <Text className="text-blue-600 text-sm font-medium">Tonight</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setQuickDate(2)}
                    className="bg-blue-100 px-3 py-2 rounded-full mr-2"
                  >
                    <Text className="text-blue-600 text-sm font-medium">Weekend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setQuickDate(3)}
                    className="bg-blue-100 px-3 py-2 rounded-full mr-2"
                  >
                    <Text className="text-blue-600 text-sm font-medium">3 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setQuickDate(7)}
                    className="bg-blue-100 px-3 py-2 rounded-full mr-2"
                  >
                    <Text className="text-blue-600 text-sm font-medium">1 Week</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {/* Guests & Rooms */}
            <View className="flex-row gap-4">
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
              title="Check-in Date"
            />
            <DatePickerModal
              visible={showCheckOutPicker}
              onClose={() => setShowCheckOutPicker(false)}
              date={checkOutDate}
              onChange={onCheckOutChange}
              minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
              title="Check-out Date"
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