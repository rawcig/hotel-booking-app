-- create-staff-table.sql
-- Create staff table

CREATE TABLE IF NOT EXISTS public.staff (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT UNIQUE,
    role_id INTEGER REFERENCES public.user_roles(id),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    hotel_id INTEGER REFERENCES public.hotels(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON public.staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_hotel_id ON public.staff(hotel_id);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON public.staff(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow public read access to active staff
CREATE POLICY "Public can view active staff" 
    ON public.staff FOR SELECT 
    USING (is_active = true);

-- Allow admin insert access to staff
CREATE POLICY "Admins can insert staff" 
    ON public.staff FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin update access to staff
CREATE POLICY "Admins can update staff" 
    ON public.staff FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Allow admin delete access to staff
CREATE POLICY "Admins can delete staff" 
    ON public.staff FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT SELECT ON TABLE public.staff TO anon;
GRANT ALL ON SEQUENCE public.staff_id_seq TO authenticated;

-- Insert sample staff members
INSERT INTO public.staff (first_name, last_name, phone_number, email, role_id, hire_date, hotel_id) VALUES
('John', 'Manager', '+1234567890', 'john.manager@grandpalace.com', 4, '2020-01-15', 1),
('Sarah', 'Receptionist', '+1234567891', 'sarah.reception@grandpalace.com', 3, '2021-03-22', 1),
('Mike', 'Concierge', '+1234567892', 'mike.concierge@grandpalace.com', 3, '2020-11-10', 1),
('Emma', 'Housekeeping', '+1234567893', 'emma.housekeeping@grandpalace.com', 3, '2019-07-05', 1)
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_staff_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON public.staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_staff_updated_at_column();