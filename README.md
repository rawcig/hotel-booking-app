# Hotel Booking App

A modern hotel booking application built with React Native and Expo, featuring:

- 🔍 Search and browse hotels
- 📅 Book stays with date selection
- 💳 Secure payment processing
- 📱 Native mobile experience
- ☁️ Supabase backend integration
- 🎨 Beautiful UI with NativeWind (Tailwind CSS for React Native)

## Features

### 🏨 Hotel Discovery
- Browse hotels by category (Popular, Recommended, Nearby, Latest)
- Search hotels by name, location, or amenities
- View detailed hotel information with image gallery
- See ratings, pricing, and available amenities

### 📅 Booking System
- Select check-in/check-out dates
- Specify number of guests and rooms
- Enter guest information
- Choose payment method
- Real-time booking confirmation

### 👤 User Profile
- Personal information management
- Booking history tracking
- Loyalty points system
- Notification preferences
- App settings

### 📱 User Experience
- Smooth navigation with tab-based interface
- Pull-to-refresh functionality
- Responsive design for all screen sizes
- Intuitive booking flow
- Offline capabilities

## Tech Stack

- **Frontend**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Query for data fetching
- **Navigation**: Expo Router
- **Backend**: Supabase (Database, Authentication, Storage)
- **Local Storage**: AsyncStorage
- **UI Components**: React Native built-in components

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your device:
   - Scan the QR code with Expo Go app
   - Or use an emulator/simulator

## Project Structure

```
app/                 # Main application screens
├── (tabs)/         # Tab navigation screens
├── booking/        # Booking flow
├── hotels/         # Hotel details
api/                # API service layer
components/         # Reusable UI components
constants/          # Static data and assets references
hooks/              # Custom React hooks
lib/                # Supabase integration
providers/          # React Query provider
server/             # Node.js/Express backend (separate service)
```

## Supabase Integration

The app uses Supabase for:
- Hotel data management
- Booking storage
- User authentication (planned)
- Real-time updates (planned)

To set up Supabase:
1. Create a Supabase project
2. Add your project URL and ANON key to `.env`
3. Run the database setup script

## Backend Options

This project includes two backend options:

1. **Supabase** (currently active) - Used directly by the React Native app
2. **Node.js/Express Server** (in `server/` directory) - A REST API server that can be run separately

### Running the Node.js/Express Server

If you want to use the Node.js/Express server instead of Supabase directly:

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Update the API service in the React Native app to use the Node.js/Express server endpoints

Note: The Node.js/Express server should be run separately from the React Native app. It cannot be run within the React Native environment because it uses Node.js built-in modules.

## Future Enhancements

- [ ] User authentication system
- [ ] Real-time booking updates
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Hotel reviews and ratings
- [ ] Map integration
- [ ] Social sharing features
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.