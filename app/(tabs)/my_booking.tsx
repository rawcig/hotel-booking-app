import BookingCard from '@/components/BookingCard';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleApiError, showConfirmation } from '@/utils/errorHandler';
import { BookingServiceError } from '@/api/services/bookings';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';

export default function MyBooking() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState('current');
  const { data: bookingsData, isLoading, refetch } = useBookings();
  const { mutate: cancelBooking } = useCancelBooking();
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is a guest
  const isGuest = user?.isGuest || !user;

  // Refresh bookings when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (!isGuest) {
        refetch();
      }
    }, [refetch, isGuest])
  );

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    if (isGuest) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch, isGuest]);

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
    
    showConfirmation(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      () => {
        cancelBooking(id, {
          onSuccess: () => {
            Alert.alert('Success', 'Booking has been cancelled');
            // Refresh the bookings list
            refetch();
          },
          onError: (error: any) => {
            console.error('Error cancelling booking:', error);
            console.error('Booking ID that failed:', id);
            
            // Handle specific error types
            if (error instanceof BookingServiceError) {
              if (error.code === 'NOT_FOUND') {
                Alert.alert('Error', 'Booking not found');
              } else if (error.code === '42501') {
                Alert.alert('Error', 'You do not have permission to cancel this booking');
              } else {
                Alert.alert('Error', error.message);
              }
            } else {
              handleApiError(error, 'cancel booking');
            }
          }
        });
      }
    );
  };

  // Handle login for guests
  const handleLogin = () => {
    router.push('/login');
  };

  return (
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
          
          {/* Guest Info */}
          {isGuest && (
            <View className="bg-yellow-50 rounded-xl p-4 mb-4">
              <Text className="text-yellow-800 font-medium mb-1">Guest Mode</Text>
              <Text className="text-yellow-700 text-sm mb-3">
                Your bookings are only saved temporarily. Sign in to keep them permanently.
              </Text>
              <TouchableOpacity 
                onPress={handleLogin}
                className="bg-yellow-500 py-2 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Sign In to Save Bookings</Text>
              </TouchableOpacity>
            </View>
          )}
          
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
          {isGuest ? (
            <View className="items-center justify-center py-20">
              <Text className="text-6xl mb-4">🏨</Text>
              <Text className="text-gray-500 text-xl font-semibold mb-2">No Bookings Found</Text>
              <Text className="text-gray-400 text-center px-8 mb-6">
                Sign in to view and manage your bookings.
              </Text>
              <TouchableOpacity 
                onPress={handleLogin}
                className="bg-blue-500 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Sign In Now</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
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
  );
}