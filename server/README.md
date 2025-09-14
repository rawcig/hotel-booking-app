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
```

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/hotels` - Get list of hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id/cancel` - Cancel a booking

## Note

This server should be run separately from the React Native app. The React Native app communicates with either this server or directly with Supabase (depending on your configuration).