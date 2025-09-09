// hooks/useBookings.ts
import { BookingListParams, bookingsService, CreateBookingRequest } from '@/api/services/bookings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useBookings = (params: BookingListParams = {}) => {
  // In a real app, you would get the actual user ID from authentication
  const userId = 'user-123'; // Placeholder user ID
  
  return useQuery({
    queryKey: ['bookings', { ...params, user_id: userId }],
    queryFn: () => bookingsService.getBookings({ ...params, user_id: userId }),
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
    mutationFn: (id: number) => {
      console.log('useCancelBooking mutationFn called with ID:', id, 'Type:', typeof id);
      return bookingsService.cancelBooking(id);
    },
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
};

export const useBookingStats = () => {
  // In a real app, you would get the actual user ID from authentication
  const userId = 'user-123'; // Placeholder user ID
  
  return useQuery({
    queryKey: ['booking-stats', userId],
    queryFn: () => bookingsService.getBookingStats(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};