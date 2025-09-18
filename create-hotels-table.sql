-- Create hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    distance TEXT,
    rating TEXT,
    price TEXT NOT NULL,
    image TEXT,
    gallery TEXT[],
    description TEXT,
    amenities TEXT[],
    coordinates JSONB
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_hotels_location ON public.hotels(location);
CREATE INDEX IF NOT EXISTS idx_hotels_rating ON public.hotels(rating);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON public.hotels(price);

-- Enable RLS (Row Level Security)
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow public read access to hotels
CREATE POLICY "Public can view hotels" 
    ON public.hotels FOR SELECT 
    USING (true);

-- Allow admin insert access to hotels
CREATE POLICY "Admins can insert hotels" 
    ON public.hotels FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin update access to hotels
CREATE POLICY "Admins can update hotels" 
    ON public.hotels FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin delete access to hotels
CREATE POLICY "Admins can delete hotels" 
    ON public.hotels FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.hotels TO authenticated;
GRANT SELECT ON TABLE public.hotels TO anon;
GRANT ALL ON SEQUENCE public.hotels_id_seq TO authenticated;

-- Insert sample hotel data
INSERT INTO public.hotels (name, location, distance, rating, price, image, gallery, description, amenities, coordinates) VALUES
('Grand Palace Hotel', 'Downtown', '2.1 km away', '4.8', '120',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
 ARRAY[
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
   'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800',
   'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
   'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
 ],
 'Experience luxury at its finest at Grand Palace Hotel. Located in the heart of downtown, our hotel offers world-class amenities, exceptional service, and stunning city views. Perfect for business travelers and vacationers alike.',
 ARRAY['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant', 'Room Service', 'Valet Parking', 'Business Center'],
 '{"latitude": 37.7749, "longitude": -122.4194}'
) ON CONFLICT DO NOTHING;

INSERT INTO public.hotels (name, location, distance, rating, price, image, gallery, description, amenities, coordinates) VALUES
('Ocean View Resort', 'Beachfront', '5.3 km away', '4.6', '89',
 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
 ARRAY[
   'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
   'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
   'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
 ],
 'Wake up to breathtaking ocean views every morning at Ocean View Resort. Our beachfront location offers direct beach access, water sports, and the perfect setting for a relaxing getaway.',
 ARRAY['Beach Access', 'Water Sports', 'Ocean View Rooms', 'Beach Bar', 'Free WiFi', 'Spa', 'Pool', 'Restaurant'],
 '{"latitude": 37.7849, "longitude": -122.4094}'
) ON CONFLICT DO NOTHING;

INSERT INTO public.hotels (name, location, distance, rating, price, image, gallery, description, amenities, coordinates) VALUES
('Mountain Lodge', 'Hillside', '8.7 km away', '4.9', '95',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
 ARRAY[
   'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
   'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
   'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
   'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800'
 ],
 'Escape to the tranquility of Mountain Lodge, nestled in the scenic hillside. Enjoy hiking trails, cozy fireplaces, and panoramic mountain views in our rustic yet luxurious accommodations.',
 ARRAY['Mountain Views', 'Hiking Trails', 'Fireplace', 'Spa', 'Restaurant', 'Free Parking', 'Pet Friendly', 'Conference Room'],
 '{"latitude": 37.7649, "longitude": -122.4294}'
) ON CONFLICT DO NOTHING;

INSERT INTO public.hotels (name, location, distance, rating, price, image, gallery, description, amenities, coordinates) VALUES
('City Center Inn', 'Central District', '1.5 km away', '4.3', '75',
 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
 ARRAY[
   'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
   'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800',
   'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800'
 ],
 'Convenient and comfortable accommodations in the heart of the city. City Center Inn offers modern amenities and easy access to shopping, dining, and entertainment.',
 ARRAY['Central Location', 'Free WiFi', 'Business Center', 'Breakfast', 'Gym', 'Parking'],
 '{"latitude": 37.7849, "longitude": -122.4194}'
) ON CONFLICT DO NOTHING;

INSERT INTO public.hotels (name, location, distance, rating, price, image, gallery, description, amenities, coordinates) VALUES
('Luxury Sky Hotel', 'Business District', '3.2 km away', '4.7', '180',
 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
 ARRAY[
   'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
   'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
   'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
 ],
 'Sophisticated luxury in the business district. Our sky-high location offers panoramic city views, premium amenities, and executive services for the discerning traveler.',
 ARRAY['City Views', 'Executive Lounge', 'Concierge', 'Fine Dining', 'Spa', 'Valet Service', 'Meeting Rooms', 'Airport Shuttle'],
 '{"latitude": 37.7749, "longitude": -122.4094}'
) ON CONFLICT DO NOTHING;