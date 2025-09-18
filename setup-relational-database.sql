-- setup-relational-database.sql
-- Complete relational database setup script for the hotel booking application

-- This script sets up a proper relational database structure with all tables
-- properly connected through foreign key relationships

-- Run this script in the Supabase SQL editor to set up the entire database

\echo 'Starting database setup...';

-- 1. Create user roles (if not exists)
\echo 'Creating user roles...';
\ir setup-user-roles.sql

-- 2. Create users table (if not exists)
\echo 'Creating users table...';
\ir setup-users-table.sql

-- 3. Create hotels table with sample data
\echo 'Creating hotels table...';
\ir create-hotels-table.sql

-- 4. Create room types table
\echo 'Creating room types table...';
\ir create-room-types-table.sql

-- 5. Create rooms table
\echo 'Creating rooms table...';
\ir create-rooms-table.sql

-- 6. Create guests table
\echo 'Creating guests table...';
\ir create-guests-table.sql

-- 7. Create staff table
\echo 'Creating staff table...';
\ir create-staff-table.sql

-- 8. Create reservations table
\echo 'Creating reservations table...';
\ir create-reservations-table.sql

-- 9. Create payments table
\echo 'Creating payments table...';
\ir create-payments-table.sql

-- 10. Create notifications table
\echo 'Creating notifications table...';
\ir create-notifications-table.sql

-- 11. Create bookings table (legacy table for backward compatibility)
\echo 'Creating bookings table...';
\ir create-bookings-table.sql

-- 12. Set up RLS for bookings (development version)
\echo 'Setting up Row Level Security...';
\ir setup-bookings-rls-dev.sql

-- 13. Grant permissions
\echo 'Granting permissions...';
\ir supabase-setup.sql

-- 14. Insert sample data for testing
\echo 'Inserting sample data...';

-- Insert sample guests
INSERT INTO public.guests (first_name, last_name, phone_number, email, date_of_birth, nationality) VALUES
('John', 'Doe', '+1234567890', 'john.doe@example.com', '1985-05-15', 'American'),
('Jane', 'Smith', '+0987654321', 'jane.smith@example.com', '1990-08-22', 'British'),
('Alice', 'Johnson', '+1122334455', 'alice.johnson@example.com', '1988-12-03', 'Canadian')
ON CONFLICT (email) DO NOTHING;

-- Insert sample reservations
INSERT INTO public.reservations (guest_id, room_id, check_in_date, check_out_date, number_of_guests, status, total_price) VALUES
(1, 1, '2025-09-20', '2025-09-25', 2, 'confirmed', 449.95),
(2, 5, '2025-09-22', '2025-09-24', 1, 'confirmed', 399.98),
(3, 10, '2025-09-25', '2025-09-30', 2, 'confirmed', 699.95)
ON CONFLICT DO NOTHING;

-- Insert sample payments
INSERT INTO public.payments (reservation_id, amount_paid, payment_method, payment_channel, payment_status, transaction_id) VALUES
(1, 449.95, 'credit_card', 'online', 'completed', 'txn_12345'),
(2, 399.98, 'paypal', 'online', 'completed', 'txn_67890'),
(3, 699.95, 'credit_card', 'online', 'completed', 'txn_54321')
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (guest_id, type, subject, message, status, sent_at) VALUES
(1, 'email', 'Booking Confirmation', 'Your booking at Grand Palace Hotel is confirmed.', 'sent', NOW()),
(2, 'sms', 'Check-in Reminder', 'Your check-in is tomorrow at Ocean View Resort.', 'sent', NOW()),
(3, 'email', 'Special Offer', 'Exclusive discount for your next stay!', 'sent', NOW())
ON CONFLICT DO NOTHING;

-- 15. Verify setup
\echo 'Verifying setup...';
SELECT COUNT(*) as hotel_count FROM public.hotels;
SELECT COUNT(*) as room_type_count FROM public.room_types;
SELECT COUNT(*) as room_count FROM public.rooms;
SELECT COUNT(*) as guest_count FROM public.guests;
SELECT COUNT(*) as staff_count FROM public.staff;
SELECT COUNT(*) as reservation_count FROM public.reservations;
SELECT COUNT(*) as payment_count FROM public.payments;
SELECT COUNT(*) as notification_count FROM public.notifications;
SELECT COUNT(*) as role_count FROM public.user_roles;
SELECT COUNT(*) as user_count FROM public.users;

-- Display completion message
\echo '=====================================================';
\echo 'Relational database setup completed successfully!';
\echo 'All tables have been created with proper relationships.';
\echo 'Sample data has been inserted for testing.';
\echo 'You can now test the application.';
\echo '=====================================================';