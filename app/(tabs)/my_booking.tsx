import { Booking, bookings as staticBookings } from '@/constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const MyBooking = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const [bookings, setBookings] = useState<Booking[]>(staticBookings);
  const [loading, setLoading] = useState(false);

  // Load bookings from AsyncStorage
  const loadBookings = async () => {
    try {
      setLoading(true);
      const savedBookings = await AsyncStorage.getItem('bookings');
      if (savedBookings) {
        const parsedBookings = JSON.parse(savedBookings);
        setBookings(parsedBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh bookings when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const currentBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  // Handle view details
  const viewBookingDetails = (booking: Booking) => {
    Alert.alert(
      `${booking.hotelName}`,
      `Guest: ${booking.guestName || 'N/A'}
Email: ${booking.guestEmail || 'N/A'}
Phone: ${booking.guestPhone || 'N/A'}
Location: ${booking.location}
Check-in: ${booking.checkIn}
Check-out: ${booking.checkOut}
Guests: ${booking.guests}
Rooms: ${booking.rooms}
Total: $${booking.totalPrice}
Status: ${booking.status.toUpperCase()}
Booked on: ${booking.bookingDate}`,
      [
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => cancelBooking(booking.id)
        },
        {
          text: 'Close',
          style: 'cancel'
        }
      ]
    );
  };

  // Cancel booking function
  const cancelBooking = async (bookingId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedBookings = bookings.map(booking =>
                booking.id === bookingId
                  ? { ...booking, status: 'cancelled' }
                  : booking
              );
              setBookings(updatedBookings);
              await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
              Alert.alert('Success', 'Booking has been cancelled');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

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
              {booking.guests} guest{booking.guests > 1 ? 's' : ''} • {booking.rooms} room{booking.rooms > 1 ? 's' : ''}
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-blue-600">
              ${booking.totalPrice}
            </Text>
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={() => viewBookingDetails(booking)}
            >
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
            {loading ? (
              <View className="items-center justify-center py-20">
                <Text className="text-gray-500 text-lg">Loading bookings...</Text>
              </View>
            ) : (
              <>
                {selectedTab === 'current' 
                  ? currentBookings.map(renderBookingCard)
                  : pastBookings.map(renderBookingCard)
                }
                
                {((selectedTab === 'current' && currentBookings.length === 0) ||
                  (selectedTab === 'past' && pastBookings.length === 0)) && (
                  <View className="items-center justify-center py-20">
                    <Text className="text-gray-500 text-lg">No bookings found</Text>
                    <Text className="text-gray-400 text-center mt-2">
                      {selectedTab === 'current' 
                        ? 'Book a hotel to see your reservations here'
                        : 'Your completed bookings will appear here'
                      }
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default MyBooking;