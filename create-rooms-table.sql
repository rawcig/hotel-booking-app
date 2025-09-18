-- create-rooms-table.sql
-- Create rooms table

CREATE TABLE IF NOT EXISTS public.rooms (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER NOT NULL REFERENCES public.room_types(id),
    room_number TEXT NOT NULL,
    floor_number INTEGER,
    view_type TEXT,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    hotel_id INTEGER NOT NULL REFERENCES public.hotels(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_room_type_id ON public.rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON public.rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON public.rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON public.rooms(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow public read access to rooms
CREATE POLICY "Public can view rooms" 
    ON public.rooms FOR SELECT 
    USING (is_active = true);

-- Allow admin insert access to rooms
CREATE POLICY "Admins can insert rooms" 
    ON public.rooms FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin update access to rooms
CREATE POLICY "Admins can update rooms" 
    ON public.rooms FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin delete access to rooms
CREATE POLICY "Admins can delete rooms" 
    ON public.rooms FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.rooms TO authenticated;
GRANT SELECT ON TABLE public.rooms TO anon;
GRANT ALL ON SEQUENCE public.rooms_id_seq TO authenticated;

-- Insert sample rooms for each hotel
-- Grand Palace Hotel (hotel_id = 1)
INSERT INTO public.rooms (room_type_id, room_number, floor_number, view_type, price_per_night, capacity, hotel_id) VALUES
(1, '101', 1, 'City View', 89.99, 2, 1),
(1, '102', 1, 'City View', 89.99, 2, 1),
(2, '201', 2, 'Garden View', 129.99, 3, 1),
(2, '202', 2, 'Garden View', 129.99, 3, 1),
(3, '301', 3, 'City View', 199.99, 4, 1),
(3, '302', 3, 'City View', 199.99, 4, 1),
(4, '401', 4, 'Garden View', 149.99, 5, 1),
(5, '501', 5, 'Panoramic View', 249.99, 4, 1)
ON CONFLICT DO NOTHING;

-- Ocean View Resort (hotel_id = 2)
INSERT INTO public.rooms (room_type_id, room_number, floor_number, view_type, price_per_night, capacity, hotel_id) VALUES
(1, '101', 1, 'Ocean View', 99.99, 2, 2),
(1, '102', 1, 'Ocean View', 99.99, 2, 2),
(2, '201', 2, 'Ocean View', 139.99, 3, 2),
(2, '202', 2, 'Ocean View', 139.99, 3, 2),
(3, '301', 3, 'Ocean View', 209.99, 4, 2),
(4, '401', 4, 'Beach View', 159.99, 5, 2)
ON CONFLICT DO NOTHING;

-- Mountain Lodge (hotel_id = 3)
INSERT INTO public.rooms (room_type_id, room_number, floor_number, view_type, price_per_night, capacity, hotel_id) VALUES
(1, '101', 1, 'Mountain View', 79.99, 2, 3),
(1, '102', 1, 'Mountain View', 79.99, 2, 3),
(2, '201', 2, 'Mountain View', 119.99, 3, 3),
(3, '301', 3, 'Panoramic Mountain View', 189.99, 4, 3),
(4, '401', 4, 'Mountain View', 139.99, 5, 3)
ON CONFLICT DO NOTHING;

-- City Center Inn (hotel_id = 4)
INSERT INTO public.rooms (room_type_id, room_number, floor_number, view_type, price_per_night, capacity, hotel_id) VALUES
(1, '101', 1, 'City View', 69.99, 2, 4),
(1, '102', 1, 'City View', 69.99, 2, 4),
(2, '201', 2, 'City View', 109.99, 3, 4),
(4, '301', 3, 'City View', 129.99, 5, 4)
ON CONFLICT DO NOTHING;

-- Luxury Sky Hotel (hotel_id = 5)
INSERT INTO public.rooms (room_type_id, room_number, floor_number, view_type, price_per_night, capacity, hotel_id) VALUES
(2, '101', 10, 'Skyline View', 149.99, 3, 5),
(2, '102', 10, 'Skyline View', 149.99, 3, 5),
(3, '201', 20, 'Panoramic Skyline View', 219.99, 4, 5),
(3, '202', 20, 'Panoramic Skyline View', 219.99, 4, 5),
(5, '301', 30, '360° Skyline View', 299.99, 4, 5),
(5, '302', 30, '360° Skyline View', 299.99, 4, 5)
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_rooms_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON public.rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_rooms_updated_at_column();