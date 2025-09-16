-- Create hotels table
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant permissions
GRANT ALL ON TABLE public.hotels TO authenticated;
GRANT ALL ON SEQUENCE public.hotels_id_seq TO authenticated;