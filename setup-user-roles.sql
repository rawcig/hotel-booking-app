-- Create default user roles
INSERT INTO public.user_roles (id, name, description) 
VALUES 
  (1, 'admin', 'Administrator with full access'),
  (2, 'user', 'Regular user with standard access'),
  (3, 'staff', 'Hotel staff member'),
  (4, 'manager', 'Hotel manager with elevated privileges')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- If the user_roles table is empty, insert default roles
INSERT INTO public.user_roles (id, name, description)
SELECT 1, 'admin', 'Administrator with full access'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE id = 1);

INSERT INTO public.user_roles (id, name, description)
SELECT 2, 'user', 'Regular user with standard access'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE id = 2);

INSERT INTO public.user_roles (id, name, description)
SELECT 3, 'staff', 'Hotel staff member'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE id = 3);

INSERT INTO public.user_roles (id, name, description)
SELECT 4, 'manager', 'Hotel manager with elevated privileges'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE id = 4);

-- Update users table to reference user_roles
-- Add foreign key constraint if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES public.user_roles(id) DEFAULT 2;

-- Update existing users to have default role
UPDATE public.users 
SET role_id = 2 
WHERE role_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);