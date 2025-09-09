// api/services/search.ts
import { supabase, Hotel } from '@/lib/supabase';

export interface SearchParams {
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const searchService = {
  // Advanced hotel search with filters
  searchHotels: async (params: SearchParams): Promise<{ hotels: Hotel[]; totalCount: number }> => {
    let query = supabase
      .from('hotels')
      .select('*', { count: 'exact' });

    // Text search
    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,location.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }

    // Location filter
    if (params.location) {
      query = query.ilike('location', `%${params.location}%`);
    }

    // Price range filter
    if (params.minPrice) {
      query = query.gte('price', params.minPrice.toString());
    }
    if (params.maxPrice) {
      query = query.lte('price', params.maxPrice.toString());
    }

    // Rating filter
    if (params.minRating) {
      query = query.gte('rating', params.minRating.toString());
    }

    // Amenities filter (this would require a join with amenities table in a real implementation)
    if (params.amenities && params.amenities.length > 0) {
      // Simple text search for amenities - in a real app, you'd have a separate amenities table
      const amenitiesQuery = params.amenities.map(amenity => `amenities.cs.{${amenity}}`).join(',');
      query = query.or(amenitiesQuery);
    }

    // Sorting
    if (params.sortBy) {
      const order = params.sortOrder || 'asc';
      query = query.order(params.sortBy, { ascending: order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    if (params.page && params.limit) {
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      hotels: data as Hotel[],
      totalCount: count || 0
    };
  },

  // Get search suggestions
  getSearchSuggestions: async (query: string): Promise<{ locations: string[]; hotels: string[] }> => {
    // Get location suggestions
    const { data: locationsData, error: locationsError } = await supabase
      .from('hotels')
      .select('location')
      .ilike('location', `%${query}%`)
      .limit(5);

    if (locationsError) {
      throw new Error(locationsError.message);
    }

    // Get hotel name suggestions
    const { data: hotelsData, error: hotelsError } = await supabase
      .from('hotels')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (hotelsError) {
      throw new Error(hotelsError.message);
    }

    const locations = [...new Set(locationsData.map(item => item.location))];
    const hotels = [...new Set(hotelsData.map(item => item.name))];

    return { locations, hotels };
  },
};