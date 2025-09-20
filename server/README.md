# Hotel Booking API Server

This is a Node.js/Express server that provides REST API endpoints for the Hotel Booking App.

## Running the Server

To run this server separately from the React Native app:

```bash
cd server
npm install
npm start
```

Or for development with auto-restart:

```bash
cd server
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in this directory with the following variables:

```
PORT=3000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setting up Storage

To enable hotel image uploads, you need to set up a storage bucket in Supabase:

1. Follow the instructions in `STORAGE_SETUP.md` to create the `hotel-images` bucket
2. Set up the appropriate policies for the bucket

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile
- `GET /api/auth` - Get all users (Admin only)
- `GET /api/auth/:id` - Get user by ID (Admin only)
- `PUT /api/auth/:id` - Update user (Admin only)
- `DELETE /api/auth/:id` - Delete user (Admin only)

### Hotels
- `GET /api/hotels` - Get list of hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels` - Create a new hotel (Admin only)
- `POST /api/hotels/upload-image` - Upload hotel image (Admin only)
- `PUT /api/hotels/:id` - Update a hotel (Admin only)
- `DELETE /api/hotels/:id` - Delete a hotel (Admin only)

### Rooms
- `GET /api/rooms` - Get list of rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create a new room (Admin only)
- `PUT /api/rooms/:id` - Update a room (Admin only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id/cancel` - Cancel a booking

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics (Admin only)
- `GET /api/admin/hotels/overview` - Get hotels overview (Admin only)
- `GET /api/admin/bookings/overview` - Get bookings overview (Admin only)
- `GET /api/admin/users/overview` - Get users overview (Admin only)

### Financial
- `GET /api/financial/summary` - Get financial summary (Admin only)
- `GET /api/financial/report` - Get detailed financial report (Admin only)
- `GET /api/financial/payment-methods` - Get payment methods breakdown (Admin only)

### Reports
- `GET /api/reports/bookings` - Get bookings report (Admin only)
- `GET /api/reports/hotels` - Get hotels report (Admin only)
- `GET /api/reports/users` - Get users report (Admin only)
- `GET /api/reports/revenue` - Get revenue report (Admin only)

## Note

This server should be run separately from the React Native app. The React Native app communicates with either this server or directly with Supabase (depending on your configuration).