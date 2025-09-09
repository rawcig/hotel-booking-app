// api/services/userProfile.ts
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  date_of_birth?: string | null;
  nationality?: string | null;
  id_document_number?: string | null;
  preferences?: {
    language?: string;
    currency?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
  } | null;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  id_document_number?: string | null;
  preferences?: UserProfile['preferences'];
}

export const userProfileService = {
  // Get user profile
  getProfile: async (userId: string): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('User profile not found');
    }

    return data as UserProfile;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: UpdateUserProfileRequest): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as UserProfile;
  },

  // Get user's favorite hotels
  getFavoriteHotels: async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        hotel_id,
        hotels(*)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return data.map(item => item.hotels);
  },

  // Add hotel to favorites
  addFavoriteHotel: async (userId: string, hotelId: number): Promise<void> => {
    const { error } = await supabase
      .from('user_favorites')
      .insert([
        {
          user_id: userId,
          hotel_id: hotelId
        }
      ]);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Remove hotel from favorites
  removeFavoriteHotel: async (userId: string, hotelId: number): Promise<void> => {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('hotel_id', hotelId);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Check if hotel is favorited
  isHotelFavorited: async (userId: string, hotelId: number): Promise<boolean> => {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('hotel_id', hotelId)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return data.length > 0;
  },
};