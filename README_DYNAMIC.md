# Hotel Booking App - Dynamic Version

This directory contains the enhanced version of your hotel booking app with dynamic data capabilities.

## What I've Provided

### 1. Frontend Enhancements (in your main app directory)
- **API Service Layer**: `api/client.ts` and `api/services/*` for communicating with backend
- **Custom React Hooks**: `hooks/useHotels.ts`, `hooks/useBookings.ts`, `hooks/useAuth.ts` for data fetching
- **Updated Components**: Modified home screen and my bookings screen to use dynamic data
- **TypeScript Types**: Proper typing for API responses and requests

### 2. Backend Server (in `server/` directory)
- **Express.js Server**: Basic REST API structure
- **Authentication Routes**: Login, signup, logout endpoints
- **Hotel Routes**: Get hotels, search, get by ID
- **Booking Routes**: Create, get, cancel bookings
- **Mock Data**: Shared hotel data between frontend and backend

## How to Use These Files

### Frontend Integration
1. Install required dependencies:
   ```bash
   npm install axios @tanstack/react-query expo-secure-store
   ```

2. The updated components (`app/(tabs)/index.tsx` and `app/(tabs)/my_booking.tsx`) now use:
   - React Query for data fetching and caching
   - Custom hooks for business logic
   - API service layer for HTTP requests

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install nodemon for development:
   ```bash
   npm install -g nodemon
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Hotels
- `GET /api/hotels` - Get all hotels (with pagination/filtering)
- `GET /api/hotels/:id` - Get hotel by ID
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/featured` - Get featured hotels

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/stats` - Get booking statistics

## Next Steps for You

### What You Need to Implement
1. **Database Integration**: Replace mock data with real database queries
2. **User Authentication**: Implement proper JWT token handling
3. **Payment Processing**: Integrate Stripe or PayPal
4. **Real-time Features**: Add messaging functionality
5. **Image Management**: Implement cloud storage for user images
6. **Security Enhancements**: Add input validation, rate limiting, etc.

### Deployment
1. **Frontend**: Deploy to Expo/React Native hosting or build native apps
2. **Backend**: Deploy to cloud provider (AWS, Google Cloud, Heroku)
3. **Database**: Set up PostgreSQL or MongoDB instance
4. **Environment Variables**: Configure production environment variables

## Technologies Used

### Frontend
- React Native/Expo
- TypeScript
- Axios for HTTP requests
- React Query for data fetching
- NativeWind for styling

### Backend
- Node.js
- Express.js
- PostgreSQL (planned)
- JWT for authentication

This structure provides a solid foundation for converting your static app to a fully dynamic application with real data, user authentication, and scalable architecture.