import BookingCard from '@/components/BookingCard';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MyBooking() {
  const [selectedTab, setSelectedTab] = useState('current');
  const { data: bookingsData, isLoading, refetch } = useBookings();
  const { mutate: cancelBooking } = useCancelBooking();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh bookings when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const currentBookings = (bookingsData?.bookings || []).filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  const pastBookings = (bookingsData?.bookings || []).filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  // Handle view details
  const viewBookingDetails = (booking: any) => {
    console.log('Booking object:', booking);
    console.log('Booking ID:', booking.id, 'Type:', typeof booking.id);
    Alert.alert(
      `${booking.hotel_name}`,
      `Guest: ${booking.guest_name || 'N/A'}
      Email: ${booking.guest_email || 'N/A'}
      Phone: ${booking.guest_phone || 'N/A'}
      Location: ${booking.location}
      Check-in: ${booking.check_in}
      Check-out: ${booking.check_out}
      Guests: ${booking.guests}
      Rooms: ${booking.rooms}
      Total: ${booking.total_price}
      Status: ${booking.status.toUpperCase()}
      Booked on: ${new Date(booking.created_at).toLocaleDateString()}`,
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
    console.log('Attempting to cancel booking with ID:', bookingId, 'Type:', typeof bookingId);
    // Ensure we're passing a number
    const id = typeof bookingId === 'string' ? parseInt(bookingId, 10) : bookingId;
    
    if (isNaN(id)) {
      console.error('Invalid booking ID:', bookingId);
      Alert.alert('Error', 'Invalid booking ID');
      return;
    }
    
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
            cancelBooking(id, {
              onSuccess: () => {
                Alert.alert('Success', 'Booking has been cancelled');
              },
              onError: (error) => {
                console.error('Error cancelling booking:', error);
                console.error('Booking ID that failed:', id);
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
        <ScrollView 
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
}