-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES public.reservations(id),
    amount_paid NUMERIC,
    payment_date DATE,
    payment_method TEXT,
    payment_channel TEXT,
    payment_status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    staff_id INTEGER REFERENCES public.staff(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payments through bookings" 
    ON public.payments FOR SELECT 
    USING (
        reservation_id IN (
            SELECT id FROM public.reservations r
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

CREATE POLICY "Staff can insert payments" 
    ON public.payments FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Staff can update payments" 
    ON public.payments FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id IN (1, 3, 4)
        )
    );

CREATE POLICY "Only admins can delete payments" 
    ON public.payments FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;