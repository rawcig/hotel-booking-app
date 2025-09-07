import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Booking } from '@/constants/data';

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onViewDetails }) => {
  return (
    <View className="bg-white rounded-2xl border-2 border-gray-200 mb-4 overflow-hidden">
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
              onPress={() => onViewDetails(booking)}
            >
              <Text className="text-white font-medium text-sm">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookingCard;