-- create-reservations-table.sql
-- Create reservations table

CREATE TABLE IF NOT EXISTS public.reservations (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER NOT NULL REFERENCES public.guests(id),
    room_id INTEGER NOT NULL REFERENCES public.rooms(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    staff_id INTEGER REFERENCES public.staff(id),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON public.reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON public.reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_check_in_date ON public.reservations(check_in_date);
CREATE INDEX IF NOT EXISTS idx_reservations_check_out_date ON public.reservations(check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_staff_id ON public.reservations(staff_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own reservations
CREATE POLICY "Users can view their own reservations" 
    ON public.reservations FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.guests g
            JOIN public.users u ON g.email = u.email
            WHERE u.id = auth.uid() AND g.id = reservations.guest_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Users can insert their own reservations
CREATE POLICY "Users can insert their own reservations" 
    ON public.reservations FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.guests g
            JOIN public.users u ON g.email = u.email
            WHERE u.id = auth.uid() AND g.id = reservations.guest_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Users can update their own reservations
CREATE POLICY "Users can update their own reservations" 
    ON public.reservations FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.guests g
            JOIN public.users u ON g.email = u.email
            WHERE u.id = auth.uid() AND g.id = reservations.guest_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Admins can delete reservations
CREATE POLICY "Admins can delete reservations" 
    ON public.reservations FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.reservations TO authenticated;
GRANT ALL ON SEQUENCE public.reservations_id_seq TO authenticated;

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_reservations_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON public.reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_reservations_updated_at_column();