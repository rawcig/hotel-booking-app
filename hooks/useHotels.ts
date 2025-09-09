// hooks/useHotels.ts
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { hotelsService, HotelListParams } from '@/api/services/hotels';
import { Hotel } from '@/lib/supabase';

export const useHotels = (params: HotelListParams = {}) => {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => hotelsService.getHotels(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useHotel = (id: number) => {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: () => hotelsService.getHotelById(id),
    enabled: !!id,
  });
};

export const useFeaturedHotels = () => {
  return useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => hotelsService.getFeaturedHotels(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useSearchHotels = (query: string) => {
  return useQuery({
    queryKey: ['search-hotels', query],
    queryFn: () => hotelsService.searchHotels(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};