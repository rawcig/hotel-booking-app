-- test-database-setup.sql
-- Test script to verify that the database setup works correctly

\echo 'Testing database setup...';

-- Test 1: Check if all tables exist
\echo 'Test 1: Checking if all tables exist...';
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
    'users', 'user_roles', 'hotels', 'room_types', 'rooms', 'guests', 'staff', 
    'reservations', 'payments', 'notifications', 'bookings'
) ORDER BY table_name;

-- Test 2: Check if sample data was inserted
\echo 'Test 2: Checking sample data...';
SELECT 'hotels' as table_name, COUNT(*) as row_count FROM public.hotels
UNION ALL
SELECT 'room_types' as table_name, COUNT(*) as row_count FROM public.room_types
UNION ALL
SELECT 'rooms' as table_name, COUNT(*) as row_count FROM public.rooms
UNION ALL
SELECT 'user_roles' as table_name, COUNT(*) as row_count FROM public.user_roles;

-- Test 3: Check if foreign key relationships work
\echo 'Test 3: Testing foreign key relationships...';
-- This will fail if foreign key constraints are not properly set up
INSERT INTO public.room_types (name, description, default_price, default_capacity) VALUES 
('Test Room Type', 'Test description', 100.00, 2);

INSERT INTO public.hotels (name, location, distance, rating, price, image) VALUES 
('Test Hotel', 'Test Location', '1 km away', '4.5', '100', 'https://example.com/test.jpg');

INSERT INTO public.rooms (room_type_id, room_number, floor_number, view_type, price_per_night, capacity, hotel_id) VALUES 
(1, 'T01', 1, 'Test View', 100.00, 2, 1);

-- Clean up test data
DELETE FROM public.rooms WHERE room_number = 'T01';
DELETE FROM public.hotels WHERE name = 'Test Hotel';
DELETE FROM public.room_types WHERE name = 'Test Room Type';

\echo 'Database setup test completed successfully!';