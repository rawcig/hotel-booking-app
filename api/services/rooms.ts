// api/services/rooms.ts
import { supabase } from '@/lib/supabase';

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

export interface RoomSearchParams {
  check_in_date?: string;
  check_out_date?: string;
  room_type_id?: number;
  capacity?: number;
  price_min?: number;
  price_max?: number;
}

export const roomsService = {
  // Get available rooms for specific dates
  getAvailableRooms: async (params: RoomSearchParams): Promise<Room[]> => {
    let query = supabase
      .from('rooms')
      .select(`
        *,
        room_type:room_types(*)
      `)
      .eq('is_active', true);

    // Filter by room type
    if (params.room_type_id) {
      query = query.eq('room_type_id', params.room_type_id);
    }

    // Filter by capacity
    if (params.capacity) {
      query = query.gte('capacity', params.capacity);
    }

    // Filter by price range
    if (params.price_min) {
      query = query.gte('price_per_night', params.price_min);
    }

    if (params.price_max) {
      query = query.lte('price_per_night', params.price_max);
    }

    // Check availability (complex logic would go here)
    // For now, we'll just return active rooms
    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data as Room[];
  },

  // Get room by ID with room type details
  getRoomById: async (id: number): Promise<Room & { room_type: RoomType }> => {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_type:room_types(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Room not found');
    }

    return data as Room & { room_type: RoomType };
  },

  // Get all room types
  getRoomTypes: async (): Promise<RoomType[]> => {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data as RoomType[];
  },
};