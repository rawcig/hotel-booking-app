import { hotels } from '@/constants/data';
import { images } from '@/constants/images';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const categories = ['Popular', 'Recommended', 'Nearby', 'Latest'];

  // Enhanced filtering logic with better performance 
  const filteredHotels = useMemo(() => {
    let filtered = hotels;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(query) ||
        hotel.location.toLowerCase().includes(query) ||
        hotel.amenities.some(amenity => amenity.toLowerCase().includes(query))
      );
    }

    // Apply category filter with enhanced logic
    switch (selectedCategory) {
      case 'Popular':
        filtered = [...filtered].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'Recommended':
        filtered = filtered.filter(hotel => parseFloat(hotel.rating) >= 4.5)
                          .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'Nearby':
        filtered = [...filtered].sort((a, b) => {
          const distanceA = parseFloat(a.distance.replace(' km away', ''));
          const distanceB = parseFloat(b.distance.replace(' km away', ''));
          return distanceA - distanceB;
        });
        break;
      case 'Latest':
        filtered = [...filtered].reverse();
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle search with debouncing effect
  const handleSearch = () => {
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
  };

  // Render hotel card with enhanced design
  const renderHotelCard = (hotel: any, index: number) => {
    const originalIndex = hotels.findIndex(h => h.name === hotel.name);
    const isTopRated = parseFloat(hotel.rating) >= 4.8;
    const isNearby = parseFloat(hotel.distance.replace(' km away', '')) <= 3;
    
    return (
      <TouchableOpacity 
        key={originalIndex}
        className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden shadow-sm"
        onPress={() => router.push(`/hotels/${originalIndex}`)}
        activeOpacity={0.95}
      >
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
            {hotel.amenities.slice(0, 3).map((amenity : any, idx : any) => (
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
              onPress={() => router.push('/booking/' + originalIndex as any)}
              className="bg-blue-500 px-6 py-3 rounded-xl shadow-sm"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
        <ScrollView 
          className="flex-1 px-6"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Enhanced Header Section */}
          <View className="flex-row justify-between items-center pt-6 mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <TouchableOpacity onPress={()=>router.push ('./profile')}>
                   <View className="relative mr-4">
                          <Image 
                            source={images.sreynuch } 
                            className="w-12 h-12 rounded-full"
                            resizeMode="cover"
                          />
                          
                        </View>
                </TouchableOpacity>
                <View>
                  <Text className="text-xl font-bold text-gray-800">Chem Sreynuch</Text>
                  <Text className="text-gray-600 text-sm">Phnom Penh, Cambodia</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <Text className="text-lg">🔔</Text>
            </TouchableOpacity>
          </View>
          
          {/* Enhanced Search Section */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              Find Your Perfect Stay ✨
            </Text>
            <View className="bg-white rounded-2xl p-2 flex-row items-center shadow-sm border border-gray-100">
              <Text className="text-gray-400 mr-3">🔍</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search hotels, places, amenities..."
                className="text-gray-800 flex-1"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={clearSearch}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-600 font-bold">✕</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={handleSearch}
                className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold">→</Text>
              </TouchableOpacity>
            </View>
            {searchQuery.length > 0 && (
              <View className="flex-row items-center mt-2">
                <Text className="text-gray-500 text-sm">
                  Found {filteredHotels.length} results for `{searchQuery}`
                </Text>
              </View>
            )}
          </View>
          
          {/* Enhanced Categories Section */}
          <View className="mb-6 ">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 px-1 pb-1">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full shadow-sm ${
                      selectedCategory === category 
                        ? 'bg-blue-500 shadow-lg' 
                        : 'bg-white border border-gray-200'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-semibold ${
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
          
          {/* Enhanced Results Info */}
         <View className=''>
           <View className="mb-4 ">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  {searchQuery ? `Search Results` : `${selectedCategory} Hotels`}
                </Text>
                <Text className="text-sm text-gray-500">
                  {filteredHotels.length} properties found
                </Text>
              </View>
              
              {/* Sort/Filter button */}
              <TouchableOpacity className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Text className="text-gray-600 text-sm mr-1">Sort</Text>
                <Text className="text-gray-400">⚙️</Text>
              </TouchableOpacity>
            </View>
            
            {selectedCategory !== 'Popular' && !searchQuery && (
              <Text className="text-gray-500 text-sm mt-1">
                {selectedCategory === 'Recommended' && '⭐ Hotels with 4.5+ rating'}
                {selectedCategory === 'Nearby' && '📍 Sorted by distance'}
                {selectedCategory === 'Latest' && '🆕 Newest listings first'}
              </Text>
            )}
          </View>
         </View>
          
          {/* Enhanced Hotels List */}
          <View className="mb-20">
            {loading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4">Loading amazing hotels...</Text>
              </View>
            ) : (
              <>
                {filteredHotels.map((hotel, index) => renderHotelCard(hotel, index))}
                
                {filteredHotels.length === 0 && (
                  <View className="items-center py-20 bg-white rounded-2xl">
                    <Text className="text-6xl mb-4">🏨</Text>
                    <Text className="text-gray-500 text-xl font-semibold mb-2">No hotels found</Text>
                    <Text className="text-gray-400 text-center px-8 mb-6">
                      {searchQuery 
                        ? `We couldn't find any hotels matching "${searchQuery}". Try adjusting your search or browse different categories.`
                        : `No hotels available in ${selectedCategory} category right now.`
                      }
                    </Text>
                    {(searchQuery || selectedCategory !== 'Popular') && (
                      <TouchableOpacity 
                        onPress={() => {
                          setSearchQuery('');
                          setSelectedCategory('Popular');
                        }}
                        className="bg-blue-500 px-6 py-3 rounded-xl"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white font-semibold">Show All Hotels</Text>
                      </TouchableOpacity>
                    )}
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