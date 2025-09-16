# Database Schema Documentation

This directory contains the SQL scripts to set up the complete database schema for the Hotel Booking App.

## Table Structure

The database consists of the following tables:

1. **users** - User accounts (already exists)
2. **user_roles** - User role definitions (already exists)
3. **bookings** - User bookings (already exists)
4. **hotels** - Hotel information
5. **room_types** - Different types of rooms
6. **rooms** - Individual rooms in hotels
7. **guests** - Guest information
8. **staff** - Hotel staff information
9. **reservations** - Room reservations
10. **reservation_bookings** - Linking table between reservations and bookings
11. **payments** - Payment records
12. **notifications** - User notifications

## Setup Instructions

To set up the complete database schema, run the following scripts in order:

1. Ensure the base tables (users, user_roles, bookings) already exist
2. Run `complete-database-setup.sql` to create all remaining tables with proper relationships and permissions

## Table Relationships

- `users` → `bookings` (One-to-Many)
- `bookings` → `reservation_bookings` (One-to-Many)
- `reservations` → `reservation_bookings` (One-to-Many)
- `hotels` → `rooms` (One-to-Many)
- `room_types` → `rooms` (One-to-Many)
- `guests` → `reservations` (One-to-Many)
- `rooms` → `reservations` (One-to-Many)
- `staff` → `reservations` (One-to-Many)
- `reservations` → `payments` (One-to-Many)
- `guests` → `notifications` (One-to-Many)

## Security

All tables have Row Level Security (RLS) policies applied to ensure proper access control:
- Users can only view their own data
- Staff and admins have broader access for management
- Only admins can delete most records