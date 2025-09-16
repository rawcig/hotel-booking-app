// hooks/useBookings.ts
import { BookingListParams, bookingsService, CreateBookingRequest, BookingServiceError } from '@/api/services/bookings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';

export const useBookings = (params: BookingListParams = {}) => {
  const { user } = useUser();
  // Use actual user ID from context, fallback to placeholder for demo
  const userId = user?.id || 'user-123';
  
  return useQuery({
    queryKey: ['bookings', { ...params, user_id: userId }],
    queryFn: () => bookingsService.getBookings({ ...params, user_id: userId }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!userId, // Only fetch when we have a user ID
    retry: (failureCount, error) => {
      // Don't retry on certain errors
      if (error instanceof BookingServiceError && error.code === 'NOT_FOUND') {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    }
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsService.getBookingById(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry on not found errors
      if (error instanceof BookingServiceError && error.code === 'NOT_FOUND') {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    }
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
    onError: (error) => {
      console.error('Create booking mutation error:', error);
    }
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => {
      console.log('useCancelBooking mutationFn called with ID:', id, 'Type:', typeof id);
      // Ensure we're passing a valid number
      if (typeof id !== 'number' || isNaN(id)) {
        throw new Error(`Invalid booking ID: ${id}`);
      }
      return bookingsService.cancelBooking(id);
    },
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
    onError: (error) => {
      console.error('useCancelBooking mutation error:', error);
    }
  });
};

export const useBookingStats = () => {
  const { user } = useUser();
  // Use actual user ID from context, fallback to placeholder for demo
  const userId = user?.id || 'user-123';
  
  return useQuery({
    queryKey: ['booking-stats', userId],
    queryFn: () => bookingsService.getBookingStats(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId, // Only fetch when we have a user ID
    retry: 2 // Retry up to 2 times
  });
};