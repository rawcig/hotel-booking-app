-- Fix RLS policies for bookings table
-- First, enable RLS if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;

-- Create new policies that allow authenticated users to view and insert their own bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own bookings" ON public.bookings
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Grant necessary permissions
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO authenticated;