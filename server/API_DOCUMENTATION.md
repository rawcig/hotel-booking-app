# Hotel Booking API Documentation

This document provides detailed information about the API endpoints available in the Hotel Booking system.

## Base URL
```
http://localhost:3000/api
```

## Authentication

### Important Note on Authentication Systems
Due to Row Level Security (RLS) restrictions in the database, we provide two authentication systems:

1. **Standard Authentication** (`/auth/login` and `/auth/register`): Requires proper Supabase service role key configuration
2. **Simple Authentication** (`/simple-auth/login` and `/simple-auth/register`): Recommended for testing and development, bypasses RLS issues

For testing purposes, we recommend using the simple authentication system which works out-of-the-box.

### POST `/simple-auth/register`
Register a new user using simple authentication system

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt-token"
}
```

### POST `/simple-auth/login`
Login user using simple authentication system

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt-token"
}
```


### POST `/auth/register`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "+1234567890" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "user"
  },
  "token": "jwt-token"
}
```

### POST `/auth/login`
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "user"
  },
  "token": "jwt-token"
}
```

### POST `/auth/logout`
Logout user

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/auth/profile`
Get current user profile

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "user"
  }
}
```

## User Management (Admin only)

### GET `/auth`
Get list of users with pagination and filtering

**Headers:**
```
Authorization: Bearer jwt-token
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Number of items per page
- `search` (string) - Search term for user name or email

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10
  }
}
```

### GET `/auth/:id`
Get user by ID

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "user",
    "role_id": 2,
    "created_at": "2025-09-20T10:30:00Z"
  }
}
```

### PUT `/auth/:id`
Update user information

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "updated@example.com",
    "name": "Updated Name",
    "phone": "+1234567890",
    "role": "user"
  }
}
```

### DELETE `/auth/:id`
Delete user (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Hotels

### GET `/hotels`
Get list of hotels with pagination and filtering

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Number of items per page
- `search` (string) - Search term for hotel name or location
- `category` (string) - Filter by category (Popular, Recommended, Nearby, Latest)

**Response:**
```json
{
  "success": true,
  "hotels": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10
  }
}
```

### GET `/hotels/:id`
Get hotel by ID

**Response:**
```json
{
  "success": true,
  "hotel": {
    "id": 1,
    "name": "Grand Palace Hotel",
    "location": "Downtown",
    "distance": "2.1 km away",
    "rating": "4.8",
    "price": "120",
    "image": "https://...",
    "gallery": ["https://...", "..."],
    "description": "Hotel description",
    "amenities": ["Free WiFi", "..."],
    "coordinates": { "latitude": 37.7749, "longitude": -122.4194 }
  }
}
```

### POST `/hotels`
Create a new hotel (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "name": "New Hotel",
  "location": "Hotel Location",
  "distance": "1.5 km away",
  "rating": "4.5",
  "price": "100",
  "image": "https://...",
  "gallery": ["https://...", "..."],
  "description": "Hotel description",
  "amenities": ["Free WiFi", "..."],
  "coordinates": { "latitude": 37.7749, "longitude": -122.4194 }
}
```

**Response:**
```json
{
  "success": true,
  "hotel": { /* hotel object */ }
}
```

### PUT `/hotels/:id`
Update a hotel (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "name": "Updated Hotel Name",
  "location": "Updated Location",
  // ... other fields to update
}
```

**Response:**
```json
{
  "success": true,
  "hotel": { /* updated hotel object */ }
}
```

## Rooms

### GET `/rooms`
Get list of rooms with filtering

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)
- `hotel_id` (integer) - Filter by hotel
- `room_type_id` (integer) - Filter by room type
- `is_active` (boolean) - Filter by active status

**Response:**
```json
{
  "success": true,
  "rooms": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 30,
    "limit": 10
  }
}
```

### GET `/rooms/:id`
Get room by ID

**Response:**
```json
{
  "success": true,
  "room": {
    "id": 1,
    "hotel_id": 1,
    "room_type_id": 1,
    "room_number": "101A",
    "floor_number": 1,
    "view_type": "City View",
    "price_per_night": "120",
    "capacity": 2,
    "is_active": true,
    "room_type": {
      "id": 1,
      "name": "Deluxe Room",
      "description": "Spacious room with upgraded furnishings",
      "default_price": "120",
      "default_capacity": 2
    }
  }
}
```

### POST `/rooms`
Create a new room (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "hotel_id": 1,
  "room_type_id": 1,
  "room_number": "101B",
  "floor_number": 1,
  "view_type": "Ocean View",
  "price_per_night": "150",
  "capacity": 2,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "room": { /* room object */ }
}
```

### PUT `/rooms/:id`
Update a room (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "price_per_night": "180",
  "is_active": false
  // ... other fields to update
}
```

**Response:**
```json
{
  "success": true,
  "room": { /* updated room object */ }
}
```

## Bookings

### GET `/bookings`
Get user bookings

**Headers:**
```
Authorization: Bearer jwt-token
```

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)
- `status` (string) - Filter by booking status (confirmed, pending, completed, cancelled)

**Response:**
```json
{
  "success": true,
  "bookings": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 15,
    "limit": 10
  }
}
```

### GET `/bookings/:id`
Get booking by ID

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": 1,
    "hotel_id": 1,
    "user_id": "user-uuid",
    "check_in": "2025-10-15",
    "check_out": "2025-10-20",
    "guests": 2,
    "rooms": 1,
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "+1234567890",
    "total_price": "600",
    "status": "confirmed",
    "hotel_name": "Grand Palace Hotel",
    "location": "Downtown",
    "image": "https://...",
    "created_at": "2025-09-20T10:30:00Z"
  }
}
```

### POST `/bookings`
Create a new booking

**Headers:**
```
Authorization: Bearer jwt-token (optional for guest bookings)
```

**Request Body:**
```json
{
  "hotel_id": 1,
  "user_id": "user-uuid", // Optional for authenticated users
  "check_in": "2025-10-15",
  "check_out": "2025-10-20",
  "guests": 2,
  "rooms": 1,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+1234567890",
  "total_price": "600",
  "hotel_name": "Grand Palace Hotel",
  "location": "Downtown",
  "image": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "booking": { /* booking object */ }
}
```

### PUT `/bookings/:id/cancel`
Cancel a booking

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": 1,
    "status": "cancelled"
    // ... other booking fields
  }
}
```

## Admin Routes

### GET `/admin/dashboard/stats`
Get dashboard statistics (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "hotels": 25,
    "rooms": 150,
    "bookings": 89
  },
  "recentBookings": [...]
}
```

### GET `/admin/hotels/overview`
Get hotels overview (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "hotels": [...]
}
```

### GET `/admin/rooms/overview`
Get rooms overview (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "rooms": [...]
}
```

### GET `/admin/bookings/overview`
Get bookings overview (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "bookings": [...]
}
```

### GET `/admin/users/overview`
Get users overview (Admin only)

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "users": [...]
}
```