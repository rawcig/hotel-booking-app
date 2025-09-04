import { hotels } from '@/constants/data';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['Popular', 'Recommended', 'Nearby', 'Latest'];

  // Enhanced filtering logic
  const filteredHotels = useMemo(() => {
    let filtered = hotels;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedCategory) {
      case 'Popular':
        // Sort by rating (highest first)
        filtered = [...filtered].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'Recommended':
        // Sort by rating, but only show 4.5+ rating
        filtered = filtered.filter(hotel => parseFloat(hotel.rating) >= 4.5)
                          .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'Nearby':
        // Sort by distance (closest first)
        filtered = [...filtered].sort((a, b) => {
          const distanceA = parseFloat(a.distance.replace(' km away', ''));
          const distanceB = parseFloat(b.distance.replace(' km away', ''));
          return distanceA - distanceB;
        });
        break;
      case 'Latest':
        // Reverse order to show "latest" (for demo purposes)
        filtered = [...filtered].reverse();
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle search
  const handleSearch = () => {
    // Search is already reactive, but we could add analytics here
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
  };

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
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={clearSearch}
                  className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-2"
                >
                  <Text className="text-gray-600 font-bold">×</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={handleSearch}
                className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center"
              >
                <Text className="text-white font-bold">🔍</Text>
              </TouchableOpacity>
            </View>
            {searchQuery.length > 0 && (
              <Text className="text-gray-500 text-sm mt-2">
                Showing results for `{searchQuery}`
              </Text>
            )}
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
          
          {/* Results Info */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-gray-800">
              {searchQuery ? `Search Results (${filteredHotels.length})` : `${selectedCategory} Hotels (${filteredHotels.length})`}
            </Text>
            {selectedCategory !== 'Popular' && !searchQuery && (
              <Text className="text-gray-500 text-sm mt-1">
                {selectedCategory === 'Recommended' && 'Hotels with 4.5+ rating'}
                {selectedCategory === 'Nearby' && 'Sorted by distance'}
                {selectedCategory === 'Latest' && 'Newest listings first'}
              </Text>
            )}
          </View>
          
          {/* Hotels List */}
          <View className="mb-20">
            {filteredHotels.map((hotel: any, index: number) => {
              // Find original index for routing
              const originalIndex = hotels.findIndex(h => h.name === hotel.name);
              
              return (
                <TouchableOpacity 
                  key={originalIndex}
                  className="bg-white rounded-2xl border-2 border-gray-200 mb-4 overflow-hidden"
                  onPress={() => router.push(`/hotels/${originalIndex}`)}
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
                    
                    {/* Category badges */}
                    <View className="flex-row gap-2 mb-3">
                      {parseFloat(hotel.rating) >= 4.8 && (
                        <View className="bg-yellow-100 px-2 py-1 rounded-full">
                          <Text className="text-yellow-700 text-xs font-medium">Top Rated</Text>
                        </View>
                      )}
                      {parseFloat(hotel.distance.replace(' km away', '')) <= 3 && (
                        <View className="bg-green-100 px-2 py-1 rounded-full">
                          <Text className="text-green-700 text-xs font-medium">Nearby</Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-xl font-bold text-blue-600">${hotel.price}</Text>
                        <Text className="text-gray-500 text-sm">per night</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => router.push('/booking/' + originalIndex as any)}
                        className="bg-blue-500 px-6 py-2 rounded-full"
                      >
                        <Text className="text-white font-medium">Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {filteredHotels.length === 0 && (
              <View className="items-center py-10">
                <Text className="text-gray-500 text-lg">No hotels found</Text>
                <Text className="text-gray-400 text-center mt-2">
                  {searchQuery 
                    ? `Try searching for something else or change category`
                    : `No hotels available in ${selectedCategory} category`
                  }
                </Text>
                {(searchQuery || selectedCategory !== 'Popular') && (
                  <TouchableOpacity 
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('Popular');
                    }}
                    className="bg-blue-500 px-4 py-2 rounded-full mt-4"
                  >
                    <Text className="text-white font-medium">Show All Hotels</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}