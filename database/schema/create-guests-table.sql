-- Create guests table
CREATE TABLE IF NOT EXISTS public.guests (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    date_of_birth DATE,
    nationality TEXT,
    id_document_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guests_updated_at 
    BEFORE UPDATE ON public.guests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only authenticated users can view guests" 
    ON public.guests FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own guest info" 
    ON public.guests FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own guest info" 
    ON public.guests FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own guest info" 
    ON public.guests FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON TABLE public.guests TO authenticated;
GRANT ALL ON SEQUENCE public.guests_id_seq TO authenticated;