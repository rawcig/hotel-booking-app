import React from 'react';
import { View, Text } from 'react-native';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const stars = [];
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Text key={`full-${i}`} className={`${sizeClasses[size]} text-yellow-400`}>★</Text>
    );
  }
  
  if (hasHalfStar) {
    stars.push(
      <Text key="half" className={`${sizeClasses[size]} text-yellow-400`}>☆</Text>
    );
  }
  
  return (
    <View className="flex-row">
      {stars}
    </View>
  );
};

export default StarRating;