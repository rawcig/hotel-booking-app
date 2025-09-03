import { hotels } from '@/constants/data';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function HotelDetail() {
  const { id } = useLocalSearchParams();
  const hotel = hotels[Number(id)];

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Header with Back Button */}
          <View className="relative">
            <Image 
              source={{ uri: hotel.image }} 
              className="h-64 w-full"
              resizeMode="cover"
            />
            <TouchableOpacity 
              onPress={() => router.back()}
              className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full items-center justify-center"
            >
              <Text className="text-lg">←</Text>
            </TouchableOpacity>
          </View>

          {/* Hotel Info */}
          <View className="p-4">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-2xl font-bold text-gray-800 flex-1">
                {hotel.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-yellow-500">⭐</Text>
                <Text className="text-gray-600 ml-1">{hotel.rating}</Text>
              </View>
            </View>
            
            <Text className="text-gray-500 mb-4">{hotel.location} • {hotel.distance}</Text>
            
            <Text className="text-3xl font-bold text-blue-600 mb-6">${hotel.price}<Text className="text-lg text-gray-500">/night</Text></Text>
            
            {/* Book Now Button */}
            <TouchableOpacity 
                onPress={() => {
                  const bookingPath = `/booking/${id}`;
                  router.push(bookingPath as any);
                }}
                className="bg-blue-500 py-4 rounded-xl"
              >
                <Text className="text-white text-center text-lg font-semibold">Book Now</Text>
              </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}