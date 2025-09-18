-- create-guests-table.sql
-- Create guests table

CREATE TABLE IF NOT EXISTS public.guests (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT UNIQUE,
    date_of_birth DATE,
    nationality TEXT,
    id_document_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone_number);
CREATE INDEX IF NOT EXISTS idx_guests_name ON public.guests(first_name, last_name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own guest record
CREATE POLICY "Users can view their own guest record" 
    ON public.guests FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND email = guests.email
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Users can insert their own guest record
CREATE POLICY "Users can insert their own guest record" 
    ON public.guests FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND email = guests.email
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Users can update their own guest record
CREATE POLICY "Users can update their own guest record" 
    ON public.guests FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND email = guests.email
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Admins can delete guest records
CREATE POLICY "Admins can delete guest records" 
    ON public.guests FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.guests TO authenticated;
GRANT ALL ON SEQUENCE public.guests_id_seq TO authenticated;

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_guests_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_guests_updated_at 
    BEFORE UPDATE ON public.guests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_guests_updated_at_column();