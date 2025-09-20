// api/services/hotels.ts
import { supabase, Hotel } from '@/lib/supabase';

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

// Custom error class for hotel service errors
export class HotelServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'HotelServiceError';
  }
}

export const hotelsService = {
  // Get list of hotels with pagination and filtering
  getHotels: async (params: HotelListParams = {}): Promise<HotelListResponse> => {
    try {
      let query = supabase
        .from('hotels')
        .select('*');
      
      // Apply search filter
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }
      
      // Apply category filter (you might need to adjust this based on your table structure)
      if (params.category) {
        // Add your category filtering logic here
      }
      
      // Apply sorting
      if (params.sortBy) {
        const order = params.sortOrder || 'asc';
        query = query.order(params.sortBy, { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination
      if (params.page && params.limit) {
        const start = (params.page - 1) * params.limit;
        const end = start + params.limit - 1;
        query = query.range(start, end);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        // Handle specific Supabase errors
        if (error.code === '42501') {
          throw new HotelServiceError('Access denied. Please contact support.', error.code);
        } else if (error.code === 'PGRST205') {
          throw new HotelServiceError('Database connection error. Please try again later.', error.code);
        } else {
          throw new HotelServiceError(`Failed to fetch hotels: ${error.message}`, error.code);
        }
      }
      
      const totalCount = count || data.length;
      const currentPage = params.page || 1;
      const totalPages = params.limit ? Math.ceil(totalCount / params.limit) : 1;
      
      return {
        hotels: data as Hotel[],
        totalCount,
        currentPage,
        totalPages
      };
    } catch (error) {
      // Re-throw our custom errors, or wrap unexpected errors
      if (error instanceof HotelServiceError) {
        throw error;
      } else {
        throw new HotelServiceError(`Unexpected error while fetching hotels: ${(error as Error).message}`);
      }
    }
  },

  // Get hotel by ID
  getHotelById: async (id: number): Promise<Hotel> => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          throw new HotelServiceError('Hotel not found', 'NOT_FOUND');
        } else {
          throw new HotelServiceError(`Failed to fetch hotel: ${error.message}`, error.code);
        }
      }
      
      if (!data) {
        throw new HotelServiceError('Hotel not found', 'NOT_FOUND');
      }
      
      return data as Hotel;
    } catch (error) {
      if (error instanceof HotelServiceError) {
        throw error;
      } else {
        throw new HotelServiceError(`Unexpected error while fetching hotel: ${(error as Error).message}`);
      }
    }
  },

  // Search hotels
  searchHotels: async (query: string): Promise<Hotel[]> => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);
      
      if (error) {
        throw new HotelServiceError(`Failed to search hotels: ${error.message}`, error.code);
      }
      
      return data as Hotel[];
    } catch (error) {
      if (error instanceof HotelServiceError) {
        throw error;
      } else {
        throw new HotelServiceError(`Unexpected error while searching hotels: ${(error as Error).message}`);
      }
    }
  },

  // Get featured hotels
  getFeaturedHotels: async (): Promise<Hotel[]> => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .gte('rating', '4.5')
        .order('rating', { ascending: false })
        .limit(5);
      
      if (error) {
        throw new HotelServiceError(`Failed to fetch featured hotels: ${error.message}`, error.code);
      }
      
      return data as Hotel[];
    } catch (error) {
      if (error instanceof HotelServiceError) {
        throw error;
      } else {
        throw new HotelServiceError(`Unexpected error while fetching featured hotels: ${(error as Error).message}`);
      }
    }
  },
};