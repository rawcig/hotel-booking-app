// seed-hotels.js
// Script to seed sample hotel data

const fetch = require('node-fetch');

async function seedHotels() {
  try {
    console.log('Seeding sample hotel data...');
    
    // Login to get auth token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'anything'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Failed to login');
      return;
    }
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    console.log('✅ Logged in successfully');
    
    // Sample hotel data
    const sampleHotels = [
      {
        name: 'Grand Palace Hotel',
        location: 'Downtown',
        distance: '2.1 km away',
        rating: 4.8,
        price: 120,
        description: 'Experience luxury at its finest at Grand Palace Hotel.',
        amenities: ['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa']
      },
      {
        name: 'Ocean View Resort',
        location: 'Beachfront',
        distance: '5.3 km away',
        rating: 4.6,
        price: 89,
        description: 'Wake up to breathtaking ocean views every morning.',
        amenities: ['Beach Access', 'Water Sports', 'Ocean View Rooms']
      },
      {
        name: 'Mountain Lodge',
        location: 'Hillside',
        distance: '8.7 km away',
        rating: 4.9,
        price: 95,
        description: 'Escape to the tranquility of Mountain Lodge.',
        amenities: ['Mountain Views', 'Hiking Trails', 'Fireplace']
      }
    ];
    
    // Add each hotel
    for (const hotel of sampleHotels) {
      console.log(`Adding hotel: ${hotel.name}`);
      
      const response = await fetch('http://localhost:3000/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotel)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added hotel: ${result.hotel.name}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to add hotel: ${hotel.name}`, error);
      }
    }
    
    console.log('✅ Hotel seeding completed!');
    
  } catch (error) {
    console.error('Error seeding hotels:', error.message);
  }
}

// Run the seed function
seedHotels();