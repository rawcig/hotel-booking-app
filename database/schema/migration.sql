-- Database Migration Script
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
    coordinates JSON
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

-- Enable RLS (Row Level Security) on all tables if not already enabled
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them

-- Hotels policies
DROP POLICY IF EXISTS "Hotels are viewable by everyone" ON public.hotels;
DROP POLICY IF EXISTS "Only admins can insert hotels" ON public.hotels;
DROP POLICY IF EXISTS "Only admins can update hotels" ON public.hotels;
DROP POLICY IF EXISTS "Only admins can delete hotels" ON public.hotels;

CREATE POLICY "Hotels are viewable by everyone" 
    ON public.hotels FOR SELECT 
    USING (true);

CREATE POLICY "Only admins can insert hotels" 
    ON public.hotels FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update hotels" 
    ON public.hotels FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete hotels" 
    ON public.hotels FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Room types policies
DROP POLICY IF EXISTS "Room types are viewable by everyone" ON public.room_types;
DROP POLICY IF EXISTS "Only admins can insert room types" ON public.room_types;
DROP POLICY IF EXISTS "Only admins can update room types" ON public.room_types;
DROP POLICY IF EXISTS "Only admins can delete room types" ON public.room_types;

CREATE POLICY "Room types are viewable by everyone" 
    ON public.room_types FOR SELECT 
    USING (true);

CREATE POLICY "Only admins can insert room types" 
    ON public.room_types FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update room types" 
    ON public.room_types FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete room types" 
    ON public.room_types FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Guests policies
DROP POLICY IF EXISTS "Only authenticated users can view guests" ON public.guests;
DROP POLICY IF EXISTS "Users can insert their own guest info" ON public.guests;
DROP POLICY IF EXISTS "Users can update their own guest info" ON public.guests;
DROP POLICY IF EXISTS "Users can delete their own guest info" ON public.guests;

CREATE POLICY "Only authenticated users can view guests" 
    ON public.guests FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own guest info" 
    ON public.guests FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own guest info" 
    ON public.guests FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own guest info" 
    ON public.guests FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Staff policies
DROP POLICY IF EXISTS "Staff info is viewable by authenticated users" ON public.staff;
DROP POLICY IF EXISTS "Only admins can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Only admins can update staff" ON public.staff;
DROP POLICY IF EXISTS "Only admins can delete staff" ON public.staff;

CREATE POLICY "Staff info is viewable by authenticated users" 
    ON public.staff FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert staff" 
    ON public.staff FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update staff" 
    ON public.staff FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete staff" 
    ON public.staff FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Rooms policies
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.rooms;
DROP POLICY IF EXISTS "Only admins can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Only admins can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Only admins can delete rooms" ON public.rooms;

CREATE POLICY "Rooms are viewable by everyone" 
    ON public.rooms FOR SELECT 
    USING (true);

CREATE POLICY "Only admins can insert rooms" 
    ON public.rooms FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update rooms" 
    ON public.rooms FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete rooms" 
    ON public.rooms FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Reservations policies
DROP POLICY IF EXISTS "Users can view their own reservations through bookings" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations or staff can update" ON public.reservations;
DROP POLICY IF EXISTS "Only admins can delete reservations" ON public.reservations;

CREATE POLICY "Users can view their own reservations through bookings" 
    ON public.reservations FOR SELECT 
    USING (
        id IN (
            SELECT reservation_id FROM public.reservation_bookings rb
            JOIN public.bookings b ON rb.booking_id = b.id
            WHERE b.user_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Authenticated users can insert reservations" 
    ON public.reservations FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reservations or staff can update" 
    ON public.reservations FOR UPDATE 
    USING (
        id IN (
            SELECT reservation_id FROM public.reservation_bookings rb
            JOIN public.bookings b ON rb.booking_id = b.id
            WHERE b.user_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can delete reservations" 
    ON public.reservations FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Reservation bookings policies
DROP POLICY IF EXISTS "Reservation bookings are viewable by linked users or staff" ON public.reservation_bookings;
DROP POLICY IF EXISTS "Authenticated users can insert reservation bookings for their bookings" ON public.reservation_bookings;
DROP POLICY IF EXISTS "Only admins can update reservation bookings" ON public.reservation_bookings;
DROP POLICY IF EXISTS "Only admins can delete reservation bookings" ON public.reservation_bookings;

CREATE POLICY "Reservation bookings are viewable by linked users or staff" 
    ON public.reservation_bookings FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.bookings WHERE id = booking_id
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Authenticated users can insert reservation bookings for their bookings" 
    ON public.reservation_bookings FOR INSERT 
    WITH CHECK (
        auth.uid() = (
            SELECT user_id FROM public.bookings WHERE id = booking_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can update reservation bookings" 
    ON public.reservation_bookings FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete reservation bookings" 
    ON public.reservation_bookings FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Bookings policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings" 
    ON public.bookings FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bookings" 
    ON public.bookings FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" 
    ON public.bookings FOR UPDATE 
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own bookings" 
    ON public.bookings FOR DELETE 
    USING (user_id = auth.uid());

-- Payments policies
DROP POLICY IF EXISTS "Users can view their own payments through bookings" ON public.payments;
DROP POLICY IF EXISTS "Staff can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Staff can update payments" ON public.payments;
DROP POLICY IF EXISTS "Only admins can delete payments" ON public.payments;

CREATE POLICY "Users can view their own payments through bookings" 
    ON public.payments FOR SELECT 
    USING (
        reservation_id IN (
            SELECT id FROM public.reservations r
            WHERE r.id IN (
                SELECT reservation_id FROM public.reservation_bookings rb
                JOIN public.bookings b ON rb.booking_id = b.id
                WHERE b.user_id = auth.uid()
            )
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Staff can insert payments" 
    ON public.payments FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Staff can update payments" 
    ON public.payments FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can delete payments" 
    ON public.payments FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Only admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Only admins can delete notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (
        guest_id IN (
            SELECT guest_id FROM public.reservations r
            WHERE r.id IN (
                SELECT reservation_id FROM public.reservation_bookings rb
                JOIN public.bookings b ON rb.booking_id = b.id
                WHERE b.user_id = auth.uid()
            )
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "System can insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can update notifications" 
    ON public.notifications FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete notifications" 
    ON public.notifications FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

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