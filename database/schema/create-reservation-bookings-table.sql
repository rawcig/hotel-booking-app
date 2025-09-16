-- Create reservation_bookings linking table
CREATE TABLE IF NOT EXISTS public.reservation_bookings (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES public.reservations(id),
    booking_id INTEGER REFERENCES public.bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.reservation_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant permissions
GRANT ALL ON TABLE public.reservation_bookings TO authenticated;
GRANT ALL ON SEQUENCE public.reservation_bookings_id_seq TO authenticated;