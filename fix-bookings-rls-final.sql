-- Fix RLS policies for bookings table to allow proper CRUD operations
-- Enable RLS if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public insert access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public update access to bookings" ON public.bookings;

-- Create policies that allow users to view, insert, and update their own bookings
-- For development, we'll allow authenticated users to work with any booking
-- In production, you would restrict this to match user_id

-- SELECT policy - users can view their own bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT auth.role()) = 'anon'  -- Allow anon for development
);

-- INSERT policy - users can insert their own bookings
CREATE POLICY "Users can insert their own bookings" ON public.bookings
FOR INSERT TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR (SELECT auth.role()) = 'anon'  -- Allow anon for development
);

-- UPDATE policy - users can update their own bookings
CREATE POLICY "Users can update their own bookings" ON public.bookings
FOR UPDATE TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT auth.role()) = 'anon'  -- Allow anon for development
)
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR (SELECT auth.role()) = 'anon'  -- Allow anon for development
);

-- Grant necessary permissions
GRANT ALL ON TABLE public.bookings TO anon, authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO anon, authenticated;