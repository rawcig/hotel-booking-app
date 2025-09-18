-- create-payments-table.sql
-- Create payments table

CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES public.reservations(id),
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT NOW(),
    payment_method TEXT NOT NULL,
    payment_channel TEXT NOT NULL CHECK (payment_channel IN ('online', 'front_desk')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded', 'failed')),
    transaction_id TEXT,
    staff_id INTEGER REFERENCES public.staff(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON public.payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_staff_id ON public.payments(staff_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own payments
CREATE POLICY "Users can view their own payments" 
    ON public.payments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.reservations r
            JOIN public.guests g ON r.guest_id = g.id
            JOIN public.users u ON g.email = u.email
            WHERE u.id = auth.uid() AND r.id = payments.reservation_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Staff and admins can insert payments
CREATE POLICY "Staff and admins can insert payments" 
    ON public.payments FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (role_id = 1 OR role_id = 3 OR role_id = 4)
        )
    );

-- Staff and admins can update payments
CREATE POLICY "Staff and admins can update payments" 
    ON public.payments FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (role_id = 1 OR role_id = 3 OR role_id = 4)
        )
    );

-- Admins can delete payments
CREATE POLICY "Admins can delete payments" 
    ON public.payments FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_payments_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_payments_updated_at_column();