// api/services/bookings.ts
import apiClient from '../client';
import { Booking } from '@/constants/data';

export interface CreateBookingRequest {
  hotelId: number;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export interface BookingListParams {
  status?: 'confirmed' | 'pending' | 'completed' | 'cancelled';
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
    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  // Get all bookings for current user
  getBookings: async (params: BookingListParams = {}): Promise<BookingListResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = `/bookings${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<BookingListResponse>(url);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (id: number): Promise<Booking> => {
    const response = await apiClient.put<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },

  // Get booking statistics
  getBookingStats: async () => {
    const response = await apiClient.get<{
      total: number;
      upcoming: number;
      completed: number;
      cancelled: number;
    }>('/bookings/stats');
    return response.data;
  },
};