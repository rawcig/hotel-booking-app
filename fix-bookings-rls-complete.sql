-- Fix RLS policies for bookings table to allow updates
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public insert access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public update access to bookings" ON public.bookings;

-- Create policies that allow public read, insert, and update for development
CREATE POLICY "Allow public read access to bookings" ON public.bookings
FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to bookings" ON public.bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to bookings" ON public.bookings
FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT ALL ON TABLE public.bookings TO anon, authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO anon, authenticated;