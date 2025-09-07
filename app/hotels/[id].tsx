import { Hotel, hotels } from '@/constants/data';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function HotelDetail() {
  const { id } = useLocalSearchParams();
  const hotelId = Array.isArray(id) ? id[0] : id;
  const hotelIndex = hotelId ? Number(hotelId) : -1;
  const hotel: Hotel | undefined = hotels[hotelIndex];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  if (!hotel || hotelIndex < 0 || hotelIndex >= hotels.length) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white justify-center items-center">
          <Text className="text-lg text-gray-500">Hotel not found</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} className="text-yellow-400 text-lg">★</Text>);
    }
    if (hasHalfStar) {
      stars.push(<Text key="half" className="text-yellow-400 text-lg">☆</Text>);
    }
    return stars;
  };

  // Image Gallery Modal
  const ImageGalleryModal = () => (
    <Modal
      visible={showGallery}
      transparent={false}
      animationType="slide"
      onRequestClose={() => setShowGallery(false)}
    >
      <SafeAreaView className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={() => setShowGallery(false)}>
            <Text className="text-white text-lg">✕</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-medium">
            {selectedImageIndex + 1} of {hotel.gallery?.length || 1}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Image Viewer */}
        <FlatList
          data={hotel.gallery || [hotel.image]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={selectedImageIndex}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setSelectedImageIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={{ width: screenWidth }}>
              <Image 
                source={{ uri: item }} 
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Header with Back Button - Your original design enhanced */}
          <View className="relative">
            <TouchableOpacity 
              onPress={() => {
                setSelectedImageIndex(0);
                setShowGallery(true);
              }}
            >
              <Image 
                source={{ uri: hotel.image }} 
                className="h-64 w-full"
                resizeMode="cover"
              />
              
              {/* Gallery indicator */}
              {hotel.gallery && hotel.gallery.length > 1 && (
                <View className="absolute bottom-4 right-4 bg-black/70 px-3 py-2 rounded-full flex-row items-center">
                  <Text className="text-white text-sm mr-1">📷</Text>
                  <Text className="text-white text-sm font-medium">{hotel.gallery.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.back()}
              className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full items-center justify-center"
            >
              <Text className="text-lg">←</Text>
            </TouchableOpacity>

            {/* Gallery Preview Thumbnails */}
            {hotel.gallery && hotel.gallery.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="absolute bottom-4 left-4"
                style={{ maxWidth: screenWidth - 120 }}
              >
                {hotel.gallery.slice(1, 4).map((image, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => {
                      setSelectedImageIndex(index + 1);
                      setShowGallery(true);
                    }}
                    className="mr-2"
                  >
                    <Image 
                      source={{ uri: image }} 
                      className="w-12 h-12 rounded-lg"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Hotel Info - Your original layout enhanced */}
          <View className="p-4">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-2xl font-bold text-gray-800 flex-1">
                {hotel.name}
              </Text>
              <View className="flex-row items-center bg-yellow-50 px-3 py-2 rounded-full">
                <View className="flex-row mr-1">
                  {renderStars(parseFloat(hotel.rating))}
                </View>
                <Text className="text-gray-800 font-medium">{hotel.rating}</Text>
              </View>
            </View>
            
            <Text className="text-gray-500 mb-4">{hotel.location} • {hotel.distance}</Text>
            
            <Text className="text-3xl font-bold text-blue-600 mb-6">
              ${hotel.price}<Text className="text-lg text-gray-500">/night</Text>
            </Text>

            {/* Description - New */}
            {hotel.description && (
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">About</Text>
                <Text className="text-gray-600 leading-6">
                  {hotel.description}
                </Text>
              </View>
            )}

            {/* Amenities - New */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">Amenities</Text>
                <View className="flex-row flex-wrap">
                  {(showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 6)).map((amenity, index) => (
                    <View key={index} className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2">
                      <Text className="text-gray-700 text-sm">{amenity}</Text>
                    </View>
                  ))}
                </View>
                {hotel.amenities.length > 6 && (
                  <TouchableOpacity 
                    onPress={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-2"
                  >
                    <Text className="text-blue-500 font-medium">
                      {showAllAmenities ? 'Show Less' : `Show All ${hotel.amenities.length} Amenities`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Reviews - New */}
            {hotel.reviews && hotel.reviews.length > 0 && (
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-bold text-gray-800">Reviews</Text>
                  <TouchableOpacity>
                    <Text className="text-blue-500 font-medium">See All</Text>
                  </TouchableOpacity>
                </View>
                
                {hotel.reviews.slice(0, 2).map((review) => (
                  <View key={review.id} className="bg-gray-50 rounded-xl p-4 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Image 
                        source={{ uri: review.avatar }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">{review.userName}</Text>
                        <View className="flex-row items-center">
                          <View className="flex-row mr-2">
                            {renderStars(review.rating)}
                          </View>
                          <Text className="text-gray-500 text-sm">{review.date}</Text>
                        </View>
                      </View>
                    </View>
                    <Text className="text-gray-600 leading-5">{review.comment}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Location - New */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-3">Location</Text>
              <View className="bg-gray-100 rounded-xl p-4">
                <Text className="text-gray-700 font-medium mb-1">{hotel.location}</Text>
                <Text className="text-gray-600">{hotel.distance} from your location</Text>
                <TouchableOpacity className="mt-3">
                  <Text className="text-blue-500 font-medium">View on Map</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Book Now Button - Your original button enhanced */}
            <TouchableOpacity 
              onPress={() => {
                router.push({
                  pathname: '/booking/[hotelId]',
                  params: { hotelId: hotelId }
                });
              }}
              className="bg-blue-500 py-4 rounded-xl mb-8"
            >
              <Text className="text-white text-center text-lg font-semibold">
                Book ${hotel.price}/night
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Image Gallery Modal */}
        <ImageGalleryModal />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}