-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    role_id INTEGER REFERENCES public.user_roles(id) DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_users_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON TABLE public.users TO authenticated;

-- Insert existing auth users into users table (if any)
-- This helps sync existing users
INSERT INTO public.users (id, name, email, role_id)
SELECT id, email, email, 2
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;