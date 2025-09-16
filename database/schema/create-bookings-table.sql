-- Create bookings table
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

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Create index on status for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Create trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to bookings table
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant permissions
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO authenticated;