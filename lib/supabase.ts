// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate that we have the required environment variables
if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL: must start with https://');
}

// Create a single supabase client for the entire application
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
export const testSupabaseConnection = async () => {
  try {
    // First check if we can connect to Supabase
    const { data: healthData, error: healthError } = await supabase
      .from('hotels')
      .select('id')
      .limit(1);
    
    if (healthError) {
      // If it's a table not found error, that's expected if tables aren't created yet
      if (healthError.code === 'PGRST205' || healthError.message.includes('not find')) {
        console.log('Supabase connection successful (tables not created yet)');
        return { success: true, data: [], message: 'Connection successful but tables not found' };
      }
      console.error('Supabase connection test failed:', healthError);
      return { success: false, error: healthError.message };
    }
    
    console.log('Supabase connection and data access successful');
    return { success: true, data: healthData };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Types for your tables (adjust based on your actual table structure)
export interface Hotel {
  id: number;
  created_at: string;
  name: string;
  location: string;
  distance: string;
  rating: string;
  price: string;
  image: string;
  gallery: string[] | null;
  description: string | null;
  amenities: string[] | null;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface RoomType {
  id: number;
  name: string;
  description: string | null;
  default_price: number | null;
  default_capacity: number | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  room_type_id: number;
  room_number: string;
  floor_number: number | null;
  view_type: string | null;
  price_per_night: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations (optional, if you use Supabase joins)
  room_type?: RoomType;
}

export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string;
  date_of_birth: string | null; // ISO date string
  nationality: string | null;
  id_document_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string;
  role_id: number;
  hire_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  role?: UserRole;
}

export interface Reservation {
  id: number;
  guest_id: number;
  room_id: number;
  check_in_date: string; // YYYY-MM-DD
  check_out_date: string; // YYYY-MM-DD
  number_of_guests: number;
  special_requests: string | null;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  staff_id: number | null;
  checked_in_at: string | null; // ISO datetime
  checked_out_at: string | null; // ISO datetime
  created_at: string;
  updated_at: string;
  // Relations
  guest?: Guest;
  room?: Room;
  staff?: Staff;
}

export interface Payment {
  id: number;
  reservation_id: number;
  amount_paid: number;
  payment_date: string; // YYYY-MM-DD
  payment_method: string;
  payment_channel: 'online' | 'front_desk';
  payment_status: 'pending' | 'completed' | 'refunded' | 'failed';
  transaction_id: string | null;
  staff_id: number | null;
  notes: string | null;
  created_at: string;
  // Relations
  reservation?: Reservation;
  staff?: Staff;
}

export interface Notification {
  id: number;
  guest_id: number;
  type: 'email' | 'sms';
  subject: string | null;
  message: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  // Relations
  guest?: Guest;
}

export interface Booking {
  id: number;
  hotel_id: number;
  user_id: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  guests: number;
  rooms: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  total_price: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  hotel_name: string;
  location: string;
  image: string;
  created_at: string;
  updated_at: string;
}