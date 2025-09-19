// server/database/seeds/seed-data.js
// Seed data for hotels, rooms, and other entities

const { supabase } = require('../../lib/supabase');

// Sample hotels data
const hotels = [
  {
    name: 'Grand Palace Hotel',
    location: 'Downtown',
    distance: '2.1 km away',
    rating: 4.8,
    price: 120,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800'
    ],
    description: 'Experience luxury at its finest at Grand Palace Hotel. Located in the heart of downtown, our hotel offers world-class amenities, exceptional service, and stunning city views. Perfect for business travelers and vacationers alike.',
    amenities: ['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant', 'Room Service', 'Valet Parking', 'Business Center'],
    coordinates: { latitude: 37.7749, longitude: -122.4194 }
  },
  {
    name: 'Ocean View Resort',
    location: 'Beachfront',
    distance: '5.3 km away',
    rating: 4.6,
    price: 89,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    description: 'Wake up to breathtaking ocean views every morning at Ocean View Resort. Our beachfront location offers direct beach access, water sports, and the perfect setting for a relaxing getaway.',
    amenities: ['Beach Access', 'Water Sports', 'Ocean View Rooms', 'Beach Bar', 'Free WiFi', 'Spa', 'Pool', 'Restaurant'],
    coordinates: { latitude: 37.7849, longitude: -122.4094 }
  },
  {
    name: 'Mountain Lodge',
    location: 'Hillside',
    distance: '8.7 km away',
    rating: 4.9,
    price: 95,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
    ],
    description: 'Escape to the tranquility of Mountain Lodge, nestled in the scenic hillside. Enjoy hiking trails, cozy fireplaces, and panoramic mountain views in our rustic yet luxurious accommodations.',
    amenities: ['Mountain Views', 'Hiking Trails', 'Fireplace', 'Spa', 'Restaurant', 'Free Parking', 'Pet Friendly', 'Conference Room'],
    coordinates: { latitude: 37.7649, longitude: -122.4294 }
  },
  {
    name: 'City Center Inn',
    location: 'Central District',
    distance: '1.5 km away',
    rating: 4.3,
    price: 75,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800'
    ],
    description: 'Convenient and comfortable accommodations in the heart of the city. City Center Inn offers modern amenities and easy access to shopping, dining, and entertainment.',
    amenities: ['Central Location', 'Free WiFi', 'Business Center', 'Breakfast', 'Gym', 'Parking'],
    coordinates: { latitude: 37.7849, longitude: -122.4194 }
  },
  {
    name: 'Luxury Sky Hotel',
    location: 'Business District',
    distance: '3.2 km away',
    rating: 4.7,
    price: 180,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
    ],
    description: 'Sophisticated luxury in the business district. Our sky-high location offers panoramic city views, premium amenities, and executive services for the discerning traveler.',
    amenities: ['City Views', 'Executive Lounge', 'Concierge', 'Fine Dining', 'Spa', 'Valet Service', 'Meeting Rooms', 'Airport Shuttle'],
    coordinates: { latitude: 37.7749, longitude: -122.4094 }
  }
];

// Sample room types
const roomTypes = [
  {
    name: 'Standard Room',
    description: 'Comfortable room with all basic amenities',
    default_price: 80,
    default_capacity: 2
  },
  {
    name: 'Deluxe Room',
    description: 'Spacious room with upgraded furnishings and city view',
    default_price: 120,
    default_capacity: 2
  },
  {
    name: 'Suite',
    description: 'Luxurious suite with separate living area and premium amenities',
    default_price: 200,
    default_capacity: 4
  },
  {
    name: 'Family Room',
    description: 'Large room suitable for families with extra beds',
    default_price: 150,
    default_capacity: 4
  },
  {
    name: 'Ocean View Room',
    description: 'Room with stunning ocean views and balcony',
    default_price: 180,
    default_capacity: 2
  }
];

// Function to seed hotels
async function seedHotels() {
  console.log('Seeding hotels...');
  
  try {
    // Insert hotels
    const { data: insertedHotels, error: hotelError } = await supabase
      .from('hotels')
      .insert(hotels)
      .select();
    
    if (hotelError) {
      console.error('Error seeding hotels:', hotelError);
      return;
    }
    
    console.log(`Successfully seeded ${insertedHotels.length} hotels`);
    return insertedHotels;
  } catch (error) {
    console.error('Error seeding hotels:', error);
  }
}

// Function to seed room types
async function seedRoomTypes() {
  console.log('Seeding room types...');
  
  try {
    // Insert room types
    const { data: insertedRoomTypes, error: roomTypeError } = await supabase
      .from('room_types')
      .insert(roomTypes)
      .select();
    
    if (roomTypeError) {
      console.error('Error seeding room types:', roomTypeError);
      return;
    }
    
    console.log(`Successfully seeded ${insertedRoomTypes.length} room types`);
    return insertedRoomTypes;
  } catch (error) {
    console.error('Error seeding room types:', error);
  }
}

// Function to seed rooms for each hotel
async function seedRooms(hotels, roomTypes) {
  console.log('Seeding rooms...');
  
  try {
    const rooms = [];
    
    // Create rooms for each hotel
    for (const hotel of hotels) {
      for (let i = 0; i < 10; i++) {
        // Randomly select a room type
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        
        rooms.push({
          hotel_id: hotel.id,
          room_type_id: roomType.id,
          room_number: `${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          floor_number: Math.floor(1 + Math.random() * 10),
          view_type: ['City View', 'Ocean View', 'Mountain View', 'Garden View'][Math.floor(Math.random() * 4)],
          price_per_night: roomType.default_price + Math.floor(Math.random() * 50),
          capacity: roomType.default_capacity,
          is_active: true
        });
      }
    }
    
    // Insert rooms
    const { data: insertedRooms, error: roomError } = await supabase
      .from('rooms')
      .insert(rooms)
      .select();
    
    if (roomError) {
      console.error('Error seeding rooms:', roomError);
      return;
    }
    
    console.log(`Successfully seeded ${insertedRooms.length} rooms`);
    return insertedRooms;
  } catch (error) {
    console.error('Error seeding rooms:', error);
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Seed hotels
    const insertedHotels = await seedHotels();
    if (!insertedHotels) return;
    
    // Seed room types
    const insertedRoomTypes = await seedRoomTypes();
    if (!insertedRoomTypes) return;
    
    // Seed rooms
    await seedRooms(insertedHotels, insertedRoomTypes);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  hotels,
  roomTypes
};