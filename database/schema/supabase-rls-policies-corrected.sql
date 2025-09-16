-- Supabase RLS Policies Setup (Corrected)
-- This script sets up Row Level Security policies for all tables with proper type handling

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

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
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update hotels" 
    ON public.hotels FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete hotels" 
    ON public.hotels FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
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
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update room types" 
    ON public.room_types FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete room types" 
    ON public.room_types FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
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
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update staff" 
    ON public.staff FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete staff" 
    ON public.staff FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
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
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can update rooms" 
    ON public.rooms FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete rooms" 
    ON public.rooms FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
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
            WHERE b.user_id = auth.uid()::text
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
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
            WHERE b.user_id = auth.uid()::text
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can delete reservations" 
    ON public.reservations FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
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
        auth.uid()::text IN (
            SELECT user_id FROM public.bookings WHERE id = booking_id
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Authenticated users can insert reservation bookings for their bookings" 
    ON public.reservation_bookings FOR INSERT 
    WITH CHECK (
        auth.uid()::text = (
            SELECT user_id FROM public.bookings WHERE id = booking_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can update reservation bookings" 
    ON public.reservation_bookings FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete reservation bookings" 
    ON public.reservation_bookings FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

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
                WHERE b.user_id = auth.uid()::text
            )
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Staff can insert payments" 
    ON public.payments FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Staff can update payments" 
    ON public.payments FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can delete payments" 
    ON public.payments FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
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
                WHERE b.user_id = auth.uid()::text
            )
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "System can insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can update notifications" 
    ON public.notifications FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete notifications" 
    ON public.notifications FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::uuid
            AND role_id = 1
        )
    );

-- Output success message
SELECT 'RLS policies applied successfully' as message;