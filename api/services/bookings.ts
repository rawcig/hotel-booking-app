// api/services/bookings.ts
import { supabase, Booking } from '@/lib/supabase';

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

export const bookingsService = {
  // Create a new booking
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([data])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return booking as Booking;
  },

  // Get all bookings for current user
  getBookings: async (params: BookingListParams = {}): Promise<BookingListResponse> => {
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
      throw new Error(error.message);
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
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('Booking not found');
    }
    
    return data as Booking;
  },

  // Cancel a booking
  cancelBooking: async (id: number): Promise<Booking> => {
    console.log('Attempting to cancel booking with ID:', id);
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error when cancelling booking:', error);
      throw new Error(error.message);
    }

    console.log('Cancel booking response data:', data);
    if (!data || data.length === 0) {
      console.error('No data returned when cancelling booking with ID:', id);
      throw new Error('Booking not found');
    }

    return data[0] as Booking;
  },

  // Get booking statistics
  getBookingStats: async (user_id: string) => {
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
      throw new Error('Failed to fetch booking stats');
    }
    
    return {
      total: total || 0,
      upcoming: upcoming || 0,
      completed: completed || 0,
      cancelled: cancelled || 0,
    };
  },
};