// api/services/reservations.ts
import { supabase } from '@/lib/supabase';

export interface CreateReservationRequest {
  guest_id: number;
  room_id: number;
  check_in_date: string; // YYYY-MM-DD
  check_out_date: string; // YYYY-MM-DD
  number_of_guests: number;
  special_requests?: string;
}

export interface Reservation {
  id: number;
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  special_requests: string | null;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  staff_id: number | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithDetails extends Reservation {
  guest: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
  };
  room: {
    room_number: string;
    floor_number: number | null;
    price_per_night: number;
    room_type: {
      name: string;
    };
  };
}

export const reservationsService = {
  // Create a new reservation
  createReservation: async (data: CreateReservationRequest): Promise<Reservation> => {
    // Check if room is available for the requested dates
    const isAvailable = await reservationsService.checkRoomAvailability(
      data.room_id,
      data.check_in_date,
      data.check_out_date
    );

    if (!isAvailable) {
      throw new Error('Room is not available for the selected dates');
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([{
        ...data,
        status: 'confirmed'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return reservation as Reservation;
  },

  // Check if a room is available for specific dates
  checkRoomAvailability: async (
    room_id: number,
    check_in_date: string,
    check_out_date: string
  ): Promise<boolean> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_id', room_id)
      .eq('status', 'confirmed')
      .lt('check_in_date', check_out_date)
      .gt('check_out_date', check_in_date);

    if (error) {
      throw new Error(error.message);
    }

    // If no overlapping reservations found, room is available
    return data.length === 0;
  },

  // Get reservations for a guest
  getGuestReservations: async (guest_id: number): Promise<ReservationWithDetails[]> => {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:first_name,last_name,email,phone_number,
        room:room_number,floor_number,price_per_night,
        room_type:name
      `)
      .eq('guest_id', guest_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as ReservationWithDetails[];
  },

  // Get reservation by ID with details
  getReservationById: async (id: number): Promise<ReservationWithDetails> => {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:first_name,last_name,email,phone_number,
        room:room_number,floor_number,price_per_night,
        room_type:name
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Reservation not found');
    }

    return data as ReservationWithDetails;
  },

  // Cancel a reservation
  cancelReservation: async (id: number): Promise<Reservation> => {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Reservation not found');
    }

    return data as Reservation;
  },

  // Check in a guest
  checkIn: async (id: number, staff_id: number): Promise<Reservation> => {
    const { data, error } = await supabase
      .from('reservations')
      .update({ 
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        staff_id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Reservation not found');
    }

    return data as Reservation;
  },

  // Check out a guest
  checkOut: async (id: number, staff_id: number): Promise<Reservation> => {
    const { data, error } = await supabase
      .from('reservations')
      .update({ 
        status: 'checked_out',
        checked_out_at: new Date().toISOString(),
        staff_id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Reservation not found');
    }

    return data as Reservation;
  },
};