-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES public.guests(id),
    type TEXT,
    subject TEXT,
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (
        guest_id IN (
            SELECT guest_id FROM public.reservations r
            WHERE r.id IN (
                SELECT reservation_id FROM public.reservation_bookings rb
                JOIN public.bookings b ON rb.booking_id = b.id
                WHERE b.user_id = auth.uid()
            )
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "System can insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can update notifications" 
    ON public.notifications FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

CREATE POLICY "Only admins can delete notifications" 
    ON public.notifications FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;