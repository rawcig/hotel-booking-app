export interface Hotel {
  name: string;
  location: string;
  distance: string;
  rating: string;
  price: string;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  reviews: Review[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export const hotels: Hotel[] = [
  { 
    name: 'Grand Palace Hotel', 
    location: 'Downtown', 
    distance: '2.1 km away', 
    rating: '4.8', 
    price: '120',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
    ],
    description: 'Experience luxury at its finest at Grand Palace Hotel. Located in the heart of downtown, our hotel offers world-class amenities, exceptional service, and stunning city views. Perfect for business travelers and vacationers alike.',
    amenities: ['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant', 'Room Service', 'Valet Parking', 'Business Center'],
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    reviews: [
      {
        id: 1,
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Absolutely wonderful stay! The staff was incredibly friendly and the room was spotless. The downtown location made it easy to explore the city.',
        date: '2025-08-15',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
      },
      {
        id: 2,
        userName: 'Michael Chen',
        rating: 4,
        comment: 'Great hotel with excellent amenities. The pool area is beautiful and the restaurant serves amazing food. Only minor issue was the elevator wait times.',
        date: '2025-08-10',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      }
    ]
  },
  { 
    name: 'Ocean View Resort', 
    location: 'Beachfront', 
    distance: '5.3 km away', 
    rating: '4.6', 
    price: '89',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    description: 'Wake up to breathtaking ocean views every morning at Ocean View Resort. Our beachfront location offers direct beach access, water sports, and the perfect setting for a relaxing getaway.',
    amenities: ['Beach Access', 'Water Sports', 'Ocean View Rooms', 'Beach Bar', 'Free WiFi', 'Spa', 'Pool', 'Restaurant'],
    coordinates: { latitude: 37.7849, longitude: -122.4094 },
    reviews: [
      {
        id: 3,
        userName: 'Emily Rodriguez',
        rating: 5,
        comment: 'Perfect beachfront location! The ocean views from our room were incredible. The staff went above and beyond to make our stay memorable.',
        date: '2025-08-12',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
      }
    ]
  },
  { 
    name: 'Mountain Lodge', 
    location: 'Hillside', 
    distance: '8.7 km away', 
    rating: '4.9', 
    price: '95',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'
    ],
    description: 'Escape to the tranquility of Mountain Lodge, nestled in the scenic hillside. Enjoy hiking trails, cozy fireplaces, and panoramic mountain views in our rustic yet luxurious accommodations.',
    amenities: ['Mountain Views', 'Hiking Trails', 'Fireplace', 'Spa', 'Restaurant', 'Free Parking', 'Pet Friendly', 'Conference Room'],
    coordinates: { latitude: 37.7649, longitude: -122.4294 },
    reviews: [
      {
        id: 4,
        userName: 'David Thompson',
        rating: 5,
        comment: 'The most peaceful and beautiful location! Perfect for a romantic getaway. The mountain views are spectacular and the service is top-notch.',
        date: '2025-08-08',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      }
    ]
  },
  { 
    name: 'City Center Inn', 
    location: 'Central District', 
    distance: '1.5 km away', 
    rating: '4.3', 
    price: '75',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800'
    ],
    description: 'Convenient and comfortable accommodations in the heart of the city. City Center Inn offers modern amenities and easy access to shopping, dining, and entertainment.',
    amenities: ['Central Location', 'Free WiFi', 'Business Center', 'Breakfast', 'Gym', 'Parking'],
    coordinates: { latitude: 37.7849, longitude: -122.4194 },
    reviews: [
      {
        id: 5,
        userName: 'Lisa Wang',
        rating: 4,
        comment: 'Great location for exploring the city. Clean rooms and friendly staff. Perfect for business trips.',
        date: '2025-08-05',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100'
      }
    ]
  },
  { 
    name: 'Luxury Sky Hotel', 
    location: 'Business District', 
    distance: '3.2 km away', 
    rating: '4.7', 
    price: '180',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    ],
    description: 'Sophisticated luxury in the business district. Our sky-high location offers panoramic city views, premium amenities, and executive services for the discerning traveler.',
    amenities: ['City Views', 'Executive Lounge', 'Concierge', 'Fine Dining', 'Spa', 'Valet Service', 'Meeting Rooms', 'Airport Shuttle'],
    coordinates: { latitude: 37.7749, longitude: -122.4094 },
    reviews: [
      {
        id: 6,
        userName: 'James Miller',
        rating: 5,
        comment: 'Exceptional luxury hotel! The city views are breathtaking and the executive lounge is perfect for business meetings.',
        date: '2025-08-03',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
      }
    ]
  }
];

// Keep existing bookings and messages data...

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
    bookingDate: '2025-09-01',
    guestName: 'John Daro',
    guestEmail: 'john.daro@email.com',
    guestPhone: '+1234567890'
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
    bookingDate: '2025-07-25',
    guestName: 'John Daro',
    guestEmail: 'john.daro@email.com',
    guestPhone: '+1234567890'
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
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
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