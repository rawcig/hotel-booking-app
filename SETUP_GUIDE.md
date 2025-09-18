# Hotel Booking App - Setup Guide

This document provides instructions for setting up and running the Hotel Booking App.

## Prerequisites

1. Node.js (version 16 or higher)
2. npm or yarn
3. Expo CLI
4. Supabase account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project in Supabase
2. Copy your Supabase URL and Anon Key
3. Add these to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project in Supabase
2. Copy your Supabase URL and Anon Key
3. Add these to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project in Supabase
2. Copy your Supabase URL and Anon Key
3. Add these to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the Database

You have several options depending on your current database state:

#### Option 1: Fresh Setup (No existing tables)
Run the following SQL scripts in your Supabase SQL editor in this order:

1. `setup-user-roles.sql` - Creates default user roles
2. `setup-users-table.sql` - Creates the users table
3. `create-hotels-table.sql` - Creates the hotels table with sample data
4. `create-bookings-table.sql` - Creates the bookings table
5. `setup-bookings-rls-dev.sql` - Sets up Row Level Security for development
6. `supabase-setup.sql` - Grants necessary permissions

#### Option 2: Fix Existing Database Structure (Recommended if you have existing tables)
If you already have tables created but with incorrect relationships, run this script:
```
fix-database-structure.sql
```

This will:
- Remove unnecessary tables (guests, rooms, room_types)
- Fix reservations table to use user_id instead of guest_id
- Fix reservations table to use hotel_id instead of room_id
- Fix notifications table to use user_id instead of guest_id
- Add user_id to payments table for better querying

#### Option 3: Simplified Relational Database Setup (Clean slate)
Run the complete simplified relational database setup script:
```
setup-simplified-database.sql
```

This creates a simplified relational database structure that:
- Uses the users table instead of a separate guests table
- Connects reservations directly to hotels (not rooms)
- Maintains proper relationships between all entities
- Includes: Users, Hotels, Staff, Reservations, Payments, Notifications, and Bookings

#### Option 4: Complete Relational Database Setup (Full Feature)
Run the complete relational database setup script:
```
setup-relational-database.sql
```

This creates a full relational database structure with all tables properly connected through foreign key relationships, including:
- Hotels and Rooms with Room Types
- Users (no separate guests table)
- Staff and User Roles
- Reservations connecting Users and Hotels
- Payments for Reservations
- Notifications for Users
- Legacy Bookings table for backward compatibility

### 4. Enable Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Enable Email signup in the Auth providers section

### 5. Run the Application

```bash
# Start the development server
npx expo start

# To run on iOS simulator
npx expo start --ios

# To run on Android emulator
npx expo start --android

# To run on web
npx expo start --web
```

### 4. Enable Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Enable Email signup in the Auth providers section

### 4. Enable Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Enable Email signup in the Auth providers section

### 5. Run the Application

```bash
# Start the development server
npx expo start

# To run on iOS simulator
npx expo start --ios

# To run on Android emulator
npx expo start --android

# To run on web
npx expo start --web
```

## Testing the Application

### Test Users

You can create test users by signing up through the app. For development purposes, you can use:

- Email: test@example.com
- Password: test123 (will be padded to meet minimum requirements)

### Test Bookings

The app includes sample hotels. You can create bookings for these hotels to test the functionality.

## Features Implemented

1. **User Authentication**
   - Sign up and login with email/password
   - Guest mode for temporary access

2. **Hotel Browsing**
   - View list of hotels
   - Search and filter hotels
   - View hotel details with image gallery

3. **Booking System**
   - Select check-in/check-out dates
   - Specify number of guests and rooms
   - Enter guest information
   - Process payments (simulated)
   - View booking confirmations

4. **User Profile**
   - Edit personal information
   - View booking history
   - Manage preferences
   - Logout functionality

5. **Notifications**
   - Booking confirmations
   - Check-in reminders
   - Special offers

## Development Scripts

- `test-booking-functionality.ts` - Comprehensive test for booking creation and cancellation
- `test-booking-cancellation.ts` - Specific test for booking cancellation
- `test-notifications.js` - Test for notification functionality

## Environment Variables

The app requires the following environment variables:

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Database Schema

The relational database includes the following tables with proper relationships:

- **hotels** - Hotel information
- **room_types** - Different types of rooms
- **rooms** - Individual rooms in hotels
- **guests** - Guest information
- **users** - Application users
- **user_roles** - User role definitions
- **staff** - Hotel staff members
- **reservations** - Room reservations
- **payments** - Payment records
- **notifications** - Guest notifications
- **bookings** - Legacy booking table (backward compatibility)

See `DATABASE_SCHEMA.md` for a detailed diagram of table relationships.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your Supabase URL and Anon Key are correct
   - Check that you've run the database setup scripts

2. **Authentication Issues**
   - Ensure Email signup is enabled in Supabase Auth settings
   - Check that the users table has been created

3. **Booking Creation Failures**
   - Verify that the bookings table exists and has proper RLS
   - Check that the user has the necessary permissions

### Resetting the Database

If you need to reset your database, you can run the setup scripts again or manually delete and recreate the tables.

## Production Considerations

For production deployment:

1. Use `setup-bookings-rls-prod.sql` instead of the development version
2. Implement real payment processing integration
3. Add proper error logging and monitoring
4. Set up email confirmations for user registration
5. Implement proper data backup strategies