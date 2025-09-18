-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    rooms INTEGER NOT NULL DEFAULT 1,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    total_price TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'completed', 'cancelled')),
    hotel_name TEXT NOT NULL,
    location TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON public.bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON public.bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON public.bookings(check_out);

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_bookings_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_bookings_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" 
    ON public.bookings FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can insert their own bookings" 
    ON public.bookings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings" 
    ON public.bookings FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own bookings
CREATE POLICY "Users can delete their own bookings" 
    ON public.bookings FOR DELETE 
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO authenticated;