import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

interface HotelCardProps {
  hotel: {
    id: number;
    name: string;
    location: string;
    distance: string;
    rating: string;
    price: string;
    image: string;
    amenities: string[];
  };
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const isTopRated = parseFloat(hotel.rating) >= 4.8;
  const isNearby = parseFloat(hotel.distance.replace(' km away', '')) <= 3;

  return (
    <View className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden shadow-sm">
      <View className="relative">
        <Image 
          source={{ uri: hotel.image }} 
          className="h-48 w-full"
          resizeMode="cover"
        />
        {/* Floating badges */}
        <View className="absolute top-3 left-3 flex-row">
          {isTopRated && (
            <View className="bg-yellow-500 px-2 py-1 rounded-full mr-2">
              <Text className="text-white text-xs font-bold">⭐ Top Rated</Text>
            </View>
          )}
          {isNearby && (
            <View className="bg-green-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">📍 Nearby</Text>
            </View>
          )}
        </View>
        
        {/* Rating badge */}
        <View className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full flex-row items-center">
          <Text className="text-yellow-400 mr-1">⭐</Text>
          <Text className="text-white font-medium">{hotel.rating}</Text>
        </View>
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold text-gray-800 flex-1" numberOfLines={1}>
            {hotel.name}
          </Text>
        </View>
        
        <Text className="text-gray-500 mb-3" numberOfLines={1}>
          📍 {hotel.location} • {hotel.distance}
        </Text>
        
        {/* Amenities preview */}
        <View className="flex-row flex-wrap mb-3">
          {hotel.amenities.slice(0, 3).map((amenity, idx) => (
            <View key={idx} className="bg-blue-50 px-2 py-1 rounded mr-2 mb-1">
              <Text className="text-blue-600 text-xs">{amenity}</Text>
            </View>
          ))}
          {hotel.amenities.length > 3 && (
            <View className="bg-gray-100 px-2 py-1 rounded">
              <Text className="text-gray-600 text-xs">+{hotel.amenities.length - 3} more</Text>
            </View>
          )}
        </View>
        
        <View className="flex-row justify-between items-center">
          <View>
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-blue-600">${hotel.price}</Text>
              <Text className="text-gray-500 text-sm ml-1">/night</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/booking/[hotelId]',
              params: { hotelId: hotel.id.toString() }
            })}
            className="bg-blue-500 px-6 py-3 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HotelCard;