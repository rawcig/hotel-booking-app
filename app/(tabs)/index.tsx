import { hotels } from '@/constants/data';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const categories = ['Popular', 'Recommended', 'Nearby', 'Latest'];
  const [searchQuery, setSearchQuery] = useState('');
   const filteredHotels = searchQuery 
    ? hotels.filter(hotel => 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : hotels;

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <ScrollView className="flex-1 px-4">
          {/* Header Section */}
          <View className="flex-row justify-between items-center pt-6 mb-6">
            <View>
            <TouchableOpacity className="w-12 h-12 flex-2 flex-row flex bg-gray-300 rounded-full"></TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">John Daro</Text>
              <Text className="text-gray-600 flex flex-row text-sm">Kon Khmer Kamjea - KKK</Text>
            </View>
          </View>
          
          {/* Search Section */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              Find Your Perfect Stay
            </Text>
            <View className="bg-gray-100 rounded-xl p-4 flex-row items-center">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search hotels, places..."
                className="text-gray-800 flex-1"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                onPress={() => {
                  // We'll add search logic here
                  console.log('Searching for:', searchQuery);
                }}
                className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center ml-2"
              >
                <Text className="text-white font-bold">🔍</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Categories Section */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full ${
                      selectedCategory === category 
                        ? 'bg-blue-500' 
                        : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`font-medium ${
                      selectedCategory === category 
                        ? 'text-white' 
                        : 'text-gray-600'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          {/* Hotels List */}
          <View className="mb-20">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Hotels'}
          </Text>
            {filteredHotels.map((hotel: any, index: number) => (
          <TouchableOpacity 
            key={index}
            className="bg-white rounded-2xl border-2 border-gray-200 mb-4 overflow-hidden"
            onPress={() => router.push(`/hotels/${index}`)}
          >
            <Image 
              source={{ uri: hotel.image }} 
              className="h-48 w-full rounded-t-2xl"
              resizeMode="cover"
            />
            <View className="p-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-bold text-gray-800 flex-1">
                  {hotel.name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500">⭐</Text>
                  <Text className="text-gray-600 ml-1">{hotel.rating}</Text>
                </View>
              </View>
              <Text className="text-gray-500 mb-3">{hotel.location} • {hotel.distance}</Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-xl font-bold text-blue-600">${hotel.price}</Text>
                  <Text className="text-gray-500 text-sm">per night</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push('/booking/' + index as any)}
                  className="bg-blue-500 px-6 py-2 rounded-full"
                >
                  <Text className="text-white font-medium">Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredHotels.length === 0 && searchQuery && (
          <View className="items-center py-10">
            <Text className="text-gray-500 text-lg">No hotels found</Text>
            <Text className="text-gray-400">Try searching for something else</Text>
          </View>
        )}

                    
                  </View>
                  
                </ScrollView>
              </SafeAreaView>
            </SafeAreaProvider>
          );
        }