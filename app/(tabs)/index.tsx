import HotelCard from '@/components/HotelCard';
import SimpleNotificationIcon from '@/components/SimpleNotificationIcon';
import { images } from '@/constants/images';
import { useUser } from '@/context/UserContext';
import { useHotels } from '@/hooks/useHotels';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if user is a guest
  const isGuest = user?.isGuest || !user;
  
  // Fetch hotels data
  const { data: hotelsData, isLoading, refetch, error } = useHotels({
    category: selectedCategory,
    search: searchQuery
  });
  
  const categories = ['Popular', 'Recommended', 'Nearby', 'Latest'];

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle search with debouncing effect
  const handleSearch = useCallback(() => {
    if (searchQuery.length > 0) {
      console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
      // The search is handled automatically by the useHotels hook when searchQuery changes
    }
  }, [searchQuery, selectedCategory]);

  // Use filtered hotels from API or empty array
  const filteredHotels = useMemo(() => {
    return hotelsData?.hotels || [];
  }, [hotelsData]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 0) {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Handle login for guests
  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <>
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
                <Text className="text-2xl font-bold text-gray-800 mb-1">Welcome back!</Text>
                <Text className="text-gray-600 text-sm mb-3">Ready for your next adventure?</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={()=>router.push('/(tabs)/profile')}>
                     <View className="relative mr-4">
                            <Image 
                              source={images.avatar1 } 
                              className="w-12 h-12 rounded-full"
                              resizeMode="cover"
                            />
                            
                          </View>
                  </TouchableOpacity>
                  <View>
                    <Text className="text-xl font-bold text-gray-800">{user?.name || 'Guest'}</Text>
                    <Text className="text-gray-600 text-sm">
                      {isGuest ? 'Guest User' : 'Phnom Penh, Cambodia'}
                    </Text>
                  </View>
                </View>
              </View>
              <SimpleNotificationIcon 
                onPress={() => router.push('/notifications')} 
                hasUnread={false} 
              />
            </View>
            
            {/* Guest Info */}
            {isGuest && (
              <View className="bg-yellow-50 rounded-xl p-4 mb-6">
                <Text className="text-yellow-800 font-medium mb-1">Guest Mode</Text>
                <Text className="text-yellow-700 text-sm">
                  Your activity is only saved temporarily. Sign in to keep your bookings and preferences permanently.
                </Text>
                <TouchableOpacity 
                  onPress={handleLogin}
                  className="mt-3 bg-yellow-500 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-medium">Sign In Now</Text>
                </TouchableOpacity>
              </View>
            )}
            
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
              {isLoading ? (
                <View className="items-center justify-center py-20">
                  <Text className="text-gray-500 text-lg">Loading hotels...</Text>
                  <View className="mt-4">
                    <View className="w-16 h-1 bg-blue-200 rounded-full overflow-hidden">
                      <View className="w-1/3 h-full bg-blue-500 rounded-full"></View>
                    </View>
                  </View>
                </View>
              ) : error ? (
                <View className="items-center py-20 bg-white rounded-2xl">
                  <Text className="text-6xl mb-4">❌</Text>
                  <Text className="text-red-500 text-xl font-semibold mb-2">Error Loading Hotels</Text>
                  <Text className="text-gray-500 text-center px-8 mb-6">
                    {error.message || 'Failed to load hotels. Please check your connection and try again.'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => refetch()}
                    className="bg-blue-500 px-6 py-3 rounded-xl"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-semibold">Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {filteredHotels.map((hotel:any) => (
                    <TouchableOpacity
                      key={hotel.id}
                      onPress={() => router.push({
                        pathname: '/hotels/[id]',
                        params: { id: hotel.id.toString() }
                      })}
                    >
                      <HotelCard hotel={hotel} />
                    </TouchableOpacity>
                  ))}
                  
                  {filteredHotels.length === 0 && !isLoading && (
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
      </>
    );
  }