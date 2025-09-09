-- Check current RLS policies for bookings table
SELECT * FROM pg_policy WHERE polrelid = 'bookings'::regclass;

-- Check if RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'bookings';

-- Check current user permissions
SELECT * FROM information_schema.role_table_grants WHERE table_name = 'bookings';