-- Production version - Proper RLS with user-based access control
-- Enable RLS if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public insert access to bookings" ON public.bookings;

-- Create policies for proper user-based access control
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" 
    ON public.bookings FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can insert their own bookings" 
    ON public.bookings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (limited)
CREATE POLICY "Users can update their own bookings" 
    ON public.bookings FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
    ON public.bookings FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Admins can update any booking
CREATE POLICY "Admins can update any booking" 
    ON public.bookings FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO authenticated;