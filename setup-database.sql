-- setup-database.sql
-- Complete database setup script for the hotel booking application

-- Run this script in the Supabase SQL editor to set up the entire database

-- 1. Create user roles (if not exists)
\ir setup-user-roles.sql

-- 2. Create users table (if not exists)
\ir setup-users-table.sql

-- 3. Create hotels table with sample data
\ir create-hotels-table.sql

-- 4. Create room types table
\ir create-room-types-table.sql

-- 5. Create rooms table
\ir create-rooms-table.sql

-- 6. Create guests table
\ir create-guests-table.sql

-- 7. Create staff table
\ir create-staff-table.sql

-- 8. Create reservations table
\ir create-reservations-table.sql

-- 9. Create payments table
\ir create-payments-table.sql

-- 10. Create notifications table
\ir create-notifications-table.sql

-- 11. Create bookings table
\ir create-bookings-table.sql

-- 12. Set up RLS for bookings (development version)
\ir setup-bookings-rls-dev.sql

-- 13. Grant permissions
\ir supabase-setup.sql

-- 14. Verify setup
SELECT COUNT(*) as hotel_count FROM public.hotels;
SELECT COUNT(*) as room_type_count FROM public.room_types;
SELECT COUNT(*) as room_count FROM public.rooms;
SELECT COUNT(*) as role_count FROM public.user_roles;
SELECT COUNT(*) as user_count FROM public.users;
SELECT COUNT(*) as staff_count FROM public.staff;
SELECT COUNT(*) as guest_count FROM public.guests;

-- Display message
\echo 'Database setup completed successfully!';
\echo 'You can now test the application.';