-- create-room-types-table.sql
-- Create room_types table

CREATE TABLE IF NOT EXISTS public.room_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    default_price DECIMAL(10, 2),
    default_capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_room_types_name ON public.room_types(name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow public read access to room types
CREATE POLICY "Public can view room types" 
    ON public.room_types FOR SELECT 
    USING (true);

-- Allow admin insert access to room types
CREATE POLICY "Admins can insert room types" 
    ON public.room_types FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin update access to room types
CREATE POLICY "Admins can update room types" 
    ON public.room_types FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin delete access to room types
CREATE POLICY "Admins can delete room types" 
    ON public.room_types FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.room_types TO authenticated;
GRANT SELECT ON TABLE public.room_types TO anon;
GRANT ALL ON SEQUENCE public.room_types_id_seq TO authenticated;

-- Insert sample room types
INSERT INTO public.room_types (name, description, default_price, default_capacity) VALUES
('Standard Room', 'Cozy room with essential amenities', 89.99, 2),
('Deluxe Room', 'Spacious room with premium amenities', 129.99, 3),
('Suite', 'Luxury suite with separate living area', 199.99, 4),
('Family Room', 'Large room suitable for families', 149.99, 5),
('Executive Suite', 'Premium suite with executive amenities', 249.99, 4)
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_room_types_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_room_types_updated_at 
    BEFORE UPDATE ON public.room_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_room_types_updated_at_column();