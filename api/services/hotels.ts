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

export const hotelsService = {
  // Get list of hotels with pagination and filtering
  getHotels: async (params: HotelListParams = {}): Promise<HotelListResponse> => {
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
      throw new Error(error.message);
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
  },

  // Get hotel by ID
  getHotelById: async (id: number): Promise<Hotel> => {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('Hotel not found');
    }
    
    return data as Hotel;
  },

  // Search hotels
  searchHotels: async (query: string): Promise<Hotel[]> => {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Hotel[];
  },

  // Get featured hotels
  getFeaturedHotels: async (): Promise<Hotel[]> => {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .gte('rating', '4.5')
      .order('rating', { ascending: false })
      .limit(5);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Hotel[];
  },
};