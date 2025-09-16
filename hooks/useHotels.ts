// hooks/useHotels.ts
import { useQuery } from '@tanstack/react-query';
import { hotelsService, HotelListParams, HotelServiceError } from '@/api/services/hotels';

export const useHotels = (params: HotelListParams = {}) => {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => hotelsService.getHotels(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on certain errors
      if (error instanceof HotelServiceError && error.code === 'NOT_FOUND') {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    }
  });
};

export const useHotel = (id: number) => {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: () => hotelsService.getHotelById(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry on not found errors
      if (error instanceof HotelServiceError && error.code === 'NOT_FOUND') {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    }
  });
};

export const useFeaturedHotels = () => {
  return useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => hotelsService.getFeaturedHotels(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2 // Retry up to 2 times
  });
};

export const useSearchHotels = (query: string) => {
  return useQuery({
    queryKey: ['search-hotels', query],
    queryFn: () => hotelsService.searchHotels(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1 // Retry once
  });
};