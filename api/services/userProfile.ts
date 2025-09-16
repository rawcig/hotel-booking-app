// api/services/userProfile.ts
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
}

export class UserProfileService {
  // Get user profile from database
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  // Update user profile in database
  static async updateProfile(userId: string, profileData: UpdateProfileData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  // Update user auth metadata
  static async updateAuthMetadata(userId: string, metadata: any): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) {
        console.error('Error updating auth metadata:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateAuthMetadata:', error);
      return false;
    }
  }

  // Upload avatar image
  static async uploadAvatar(userId: string, file: File | Blob, fileName: string): Promise<string | null> {
    try {
      const filePath = `avatars/${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return null;
    }
  }

  // Get public URL for avatar
  static getAvatarUrl(filePath: string): string | null {
    try {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  }
}

export default UserProfileService;