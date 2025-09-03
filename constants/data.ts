export const hotels = [
  { 
    name: 'Grand Palace Hotel', 
    location: 'Downtown', 
    distance: '2.1 km away', 
    rating: '4.8', 
    price: '120',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
  },
  { 
    name: 'Ocean View Resort', 
    location: 'Beachfront', 
    distance: '5.3 km away', 
    rating: '4.6', 
    price: '89',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400'
  },
  { 
    name: 'Mountain Lodge', 
    location: 'Hillside', 
    distance: '8.7 km away', 
    rating: '4.9', 
    price: '95',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
  },
];

export const bookings = [
  {
    id: 1,
    hotelName: 'Grand Palace Hotel',
    location: 'Downtown',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    checkIn: '2025-09-15',
    checkOut: '2025-09-18',
    guests: 2,
    rooms: 1,
    totalPrice: '360',
    status: 'confirmed', // confirmed, pending, completed, cancelled
    bookingDate: '2025-09-01'
  },
  {
    id: 2,
    hotelName: 'Ocean View Resort',
    location: 'Beachfront',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    checkIn: '2025-08-10',
    checkOut: '2025-08-12',
    guests: 1,
    rooms: 1,
    totalPrice: '178',
    status: 'completed',
    bookingDate: '2025-07-25'
  }
];
export interface Booking {
  id: number;
  hotelName: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: string;
  status: string;
  bookingDate: string;
}

export const messages = [
  {
    id: 1,
    hotelName: 'Grand Palace Hotel',
    lastMessage: 'Your booking has been confirmed! Check-in is at 3 PM.',
    time: '2:30 PM',
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100',
    type: 'hotel' // hotel, support, booking
  },
  {
    id: 2,
    hotelName: 'Customer Support',
    lastMessage: 'Hi! How can we help you today?',
    time: '1:15 PM', 
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    type: 'support'
  },
  {
    id: 3,
    hotelName: 'Ocean View Resort',
    lastMessage: 'Thank you for staying with us! Please rate your experience.',
    time: 'Yesterday',
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100',
    type: 'hotel'
  }
];
// export const categories = ['Popular', 'Recommended', 'Nearby', 'Latest'];