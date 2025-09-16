// api/services/bookings.ts
import { supabase, Booking } from '@/lib/supabase';
import { HotelServiceError } from './hotels';

export interface CreateBookingRequest {
  hotel_id: number;
  user_id: string;
  check_in: string; // ISO date string
  check_out: string; // ISO date string
  guests: number;
  rooms: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  total_price: string;
  hotel_name: string;
  location: string;
  image: string;
}

export interface BookingListParams {
  user_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface BookingListResponse {
  bookings: Booking[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Custom error class for booking service errors
export class BookingServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BookingServiceError';
  }
}

export const bookingsService = {
  // Create a new booking
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    try {
      // If this is a guest booking (user_id starts with 'guest-'), 
      // we should also create a guest record
      let guestId = null;
      if (data.user_id.startsWith('guest-')) {
        // Create a guest record for this booking
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .insert([
            {
              first_name: data.guest_name.split(' ')[0] || data.guest_name,
              last_name: data.guest_name.split(' ').slice(1).join(' ') || '',
              phone_number: data.guest_phone,
              email: data.guest_email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
        
        if (guestError) {
          console.warn('Failed to create guest record:', guestError);
          // Continue with booking even if guest record creation fails
        } else {
          guestId = guestData.id;
        }
      }
      
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([data])
        .select()
        .single();
      
      if (error) {
        // Handle specific Supabase errors
        if (error.code === '42501') {
          throw new BookingServiceError('Access denied. You do not have permission to create bookings.', error.code);
        } else if (error.code === '23505') {
          throw new BookingServiceError('A booking with these details already exists.', error.code);
        } else if (error.code === 'PGRST205') {
          throw new BookingServiceError('Database connection error. Please try again later.', error.code);
        } else {
          throw new BookingServiceError(`Failed to create booking: ${error.message}`, error.code);
        }
      }
      
      return booking as Booking;
    } catch (error) {
      // Re-throw our custom errors, or wrap unexpected errors
      if (error instanceof BookingServiceError) {
        throw error;
      } else if (error instanceof HotelServiceError) {
        // Re-throw hotel service errors
        throw error;
      } else {
        throw new BookingServiceError(`Unexpected error while creating booking: ${error.message}`);
      }
    }
  },

  // Get all bookings for current user
  getBookings: async (params: BookingListParams = {}): Promise<BookingListResponse> => {
    try {
      let query = supabase
        .from('bookings')
        .select('*', { count: 'exact' });
      
      // Filter by user
      if (params.user_id) {
        query = query.eq('user_id', params.user_id);
      }
      
      // Filter by status
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      // Apply sorting
      query = query.order('created_at', { ascending: false });
      
      // Apply pagination
      if (params.page && params.limit) {
        const start = (params.page - 1) * params.limit;
        const end = start + params.limit - 1;
        query = query.range(start, end);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        throw new BookingServiceError(`Failed to fetch bookings: ${error.message}`, error.code);
      }
      
      const totalCount = count || data.length;
      const currentPage = params.page || 1;
      const totalPages = params.limit ? Math.ceil(totalCount / params.limit) : 1;
      
      return {
        bookings: data as Booking[],
        totalCount,
        currentPage,
        totalPages
      };
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      } else {
        throw new BookingServiceError(`Unexpected error while fetching bookings: ${error.message}`);
      }
    }
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<Booking> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          throw new BookingServiceError('Booking not found', 'NOT_FOUND');
        } else {
          throw new BookingServiceError(`Failed to fetch booking: ${error.message}`, error.code);
        }
      }
      
      if (!data) {
        throw new BookingServiceError('Booking not found', 'NOT_FOUND');
      }
      
      return data as Booking;
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      } else {
        throw new BookingServiceError(`Unexpected error while fetching booking: ${error.message}`);
      }
    }
  },

  // Cancel a booking
  cancelBooking: async (id: number): Promise<Booking> => {
    try {
      console.log('Attempting to cancel booking with ID:', id);
      
      // First, verify the booking exists and belongs to the user
      const { data: existingBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // No rows returned
        throw new BookingServiceError('Booking not found', 'NOT_FOUND');
      }

      if (fetchError) {
        console.error('Error fetching booking:', fetchError);
        throw new BookingServiceError(`Failed to find booking: ${fetchError.message}`, fetchError.code);
      }

      if (!existingBooking) {
        throw new BookingServiceError('Booking not found', 'NOT_FOUND');
      }

      // Update the booking status
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error when cancelling booking:', error);
        // Handle RLS errors specifically
        if (error.code === '42501') {
          throw new BookingServiceError('You do not have permission to cancel this booking. Please make sure you are logged in and trying to cancel your own booking.', error.code);
        }
        throw new BookingServiceError(`Failed to cancel booking: ${error.message}`, error.code);
      }

      if (!data) {
        console.error('No data returned when cancelling booking with ID:', id);
        throw new BookingServiceError('Booking cancellation failed - no data returned', 'NO_DATA');
      }

      return data as Booking;
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      } else {
        throw new BookingServiceError(`Unexpected error while cancelling booking: ${error.message}`);
      }
    }
  },

  // Get booking statistics
  getBookingStats: async (user_id: string) => {
    try {
      const { count: total, error: totalError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id);
      
      const { count: upcoming, error: upcomingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id)
        .eq('status', 'confirmed');
      
      const { count: completed, error: completedError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id)
        .eq('status', 'completed');
      
      const { count: cancelled, error: cancelledError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id)
        .eq('status', 'cancelled');
      
      if (totalError || upcomingError || completedError || cancelledError) {
        const errors = [totalError, upcomingError, completedError, cancelledError].filter(Boolean);
        throw new BookingServiceError(`Failed to fetch booking stats: ${errors[0]?.message}`, errors[0]?.code);
      }
      
      return {
        total: total || 0,
        upcoming: upcoming || 0,
        completed: completed || 0,
        cancelled: cancelled || 0,
      };
    } catch (error) {
      if (error instanceof BookingServiceError) {
        throw error;
      } else {
        throw new BookingServiceError(`Unexpected error while fetching booking stats: ${error.message}`);
      }
    }
  },
};