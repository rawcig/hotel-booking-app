// api/services/hotels.ts
import apiClient from '../client';
import { Hotel } from '@/constants/data';

export interface HotelListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface HotelListResponse {
  hotels: Hotel[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export const hotelsService = {
  // Get list of hotels with pagination and filtering
  getHotels: async (params: HotelListParams = {}): Promise<HotelListResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = `/hotels${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<HotelListResponse>(url);
    return response.data;
  },

  // Get hotel by ID
  getHotelById: async (id: number): Promise<Hotel> => {
    const response = await apiClient.get<Hotel>(`/hotels/${id}`);
    return response.data;
  },

  // Search hotels
  searchHotels: async (query: string): Promise<Hotel[]> => {
    const response = await apiClient.get<Hotel[]>(`/hotels/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get featured hotels
  getFeaturedHotels: async (): Promise<Hotel[]> => {
    const response = await apiClient.get<Hotel[]>('/hotels/featured');
    return response.data;
  },
};