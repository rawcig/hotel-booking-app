import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BookingCard from '@/components/BookingCard';

const MyBooking = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const { data: bookingsData, isLoading, refetch } = useBookings();
  const { mutate: cancelBooking } = useCancelBooking();

  // Refresh bookings when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const currentBookings = (bookingsData?.bookings || []).filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  const pastBookings = (bookingsData?.bookings || []).filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  // Handle view details
  const viewBookingDetails = (booking: any) => {
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
          onPress: () => handleCancelBooking(booking.id)
        },
        {
          text: 'Close',
          style: 'cancel'
        }
      ]
    );
  };

  // Cancel booking function
  const handleCancelBooking = (bookingId: number) => {
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
          onPress: () => {
            cancelBooking(bookingId, {
              onSuccess: () => {
                Alert.alert('Success', 'Booking has been cancelled');
              },
              onError: (error) => {
                console.error('Error cancelling booking:', error);
                Alert.alert('Error', 'Failed to cancel booking');
              }
            });
          }
        }
      ]
    );
  };

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
            {isLoading ? (
              <View className="items-center justify-center py-20">
                <Text className="text-gray-500 text-lg">Loading bookings...</Text>
              </View>
            ) : (
              <>
                {selectedTab === 'current' 
                  ? currentBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onViewDetails={viewBookingDetails} 
                      />
                    ))
                  : pastBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onViewDetails={viewBookingDetails} 
                      />
                    ))
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