-- Create rooms table
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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON public.rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant permissions
GRANT ALL ON TABLE public.rooms TO authenticated;
GRANT ALL ON SEQUENCE public.rooms_id_seq TO authenticated;