-- Create reservations table
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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON public.reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant permissions
GRANT ALL ON TABLE public.reservations TO authenticated;
GRANT ALL ON SEQUENCE public.reservations_id_seq TO authenticated;