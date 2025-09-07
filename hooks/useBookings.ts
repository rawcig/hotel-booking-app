// hooks/useBookings.ts
import { BookingListParams, bookingsService, CreateBookingRequest } from '@/api/services/bookings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useBookings = (params: BookingListParams = {}) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingsService.getBookings(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsService.getBookingById(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingsService.createBooking(data),
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => bookingsService.cancelBooking(id),
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: ['booking-stats'],
    queryFn: () => bookingsService.getBookingStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};