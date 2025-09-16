-- Supabase Database Migration Script
-- This script updates an existing database with new tables and relationships

-- Check if tables already exist, if not create them

-- Create hotels table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hotels (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    location TEXT,
    distance TEXT,
    rating TEXT,
    price TEXT,
    image TEXT,
    gallery TEXT[],
    description TEXT,
    amenities TEXT[],
    coordinates JSONB
);

-- Create room_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.room_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    default_price NUMERIC,
    default_capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.guests (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    date_of_birth DATE,
    nationality TEXT,
    id_document_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.staff (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    role_id INTEGER REFERENCES public.user_roles(id),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rooms (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER REFERENCES public.room_types(id),
    room_number TEXT,
    floor_number INTEGER,
    view_type TEXT,
    price_per_night NUMERIC,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reservations (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES public.guests(id),
    room_id INTEGER REFERENCES public.rooms(id),
    check_in_date DATE,
    check_out_date DATE,
    number_of_guests INTEGER,
    special_requests TEXT,
    status TEXT DEFAULT 'confirmed',
    staff_id INTEGER REFERENCES public.staff(id),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservation_bookings linking table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reservation_bookings (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES public.reservations(id),
    booking_id INTEGER REFERENCES public.bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bookings (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER,
    user_id UUID REFERENCES public.users(id),
    check_in DATE,
    check_out DATE,
    guests INTEGER,
    rooms INTEGER,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    total_price TEXT,
    status TEXT DEFAULT 'confirmed',
    hotel_name TEXT,
    location TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES public.reservations(id),
    amount_paid NUMERIC,
    payment_date DATE,
    payment_method TEXT,
    payment_channel TEXT,
    payment_status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    staff_id INTEGER REFERENCES public.staff(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES public.guests(id),
    type TEXT,
    subject TEXT,
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace triggers for updated_at columns
DROP TRIGGER IF EXISTS update_room_types_updated_at ON public.room_types;
CREATE TRIGGER update_room_types_updated_at 
    BEFORE UPDATE ON public.room_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON public.rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
CREATE TRIGGER update_guests_updated_at 
    BEFORE UPDATE ON public.guests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON public.staff;
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON public.staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON public.reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on all tables and sequences
GRANT ALL ON TABLE public.hotels TO authenticated;
GRANT ALL ON TABLE public.room_types TO authenticated;
GRANT ALL ON TABLE public.guests TO authenticated;
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT ALL ON TABLE public.rooms TO authenticated;
GRANT ALL ON TABLE public.reservations TO authenticated;
GRANT ALL ON TABLE public.reservation_bookings TO authenticated;
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.notifications TO authenticated;

-- Grant permissions on all sequences
GRANT ALL ON SEQUENCE public.hotels_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.room_types_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.guests_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.staff_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.rooms_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reservations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reservation_bookings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;

-- Output success message
SELECT 'Database migration completed successfully' as message;