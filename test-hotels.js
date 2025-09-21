// test-hotels.js
// Simple test script to check hotel data fetching

const fetch = require('node-fetch');

async function testHotelsAPI() {
  try {
    console.log('Testing hotels API...');
    
    // First, login to get a token
    console.log('\n1. Logging in...');
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
      console.log('❌ Login failed');
      return;
    }
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    console.log('✅ Login successful, token received');
    
    // Test fetching hotels
    console.log('\n2. Fetching hotels...');
    const hotelsResponse = await fetch('http://localhost:3000/api/hotels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Hotels response status:', hotelsResponse.status);
    
    if (hotelsResponse.ok) {
      const hotelsResult = await hotelsResponse.json();
      console.log('Hotels response:', JSON.stringify(hotelsResult, null, 2));
      
      if (hotelsResult.success && hotelsResult.hotels) {
        console.log(`✅ Successfully fetched ${hotelsResult.hotels.length} hotels`);
        
        // Check if there's pagination info
        if (hotelsResult.pagination) {
          console.log('Pagination info:', hotelsResult.pagination);
        }
      } else {
        console.log('❌ No hotels data in response');
      }
    } else {
      const errorText = await hotelsResponse.text();
      console.log('❌ Hotels fetch failed:', errorText);
    }
    
    // Test creating a sample hotel
    console.log('\n3. Creating a sample hotel...');
    const sampleHotel = {
      name: 'Test Hotel',
      location: 'Test Location',
      distance: '1 km away',
      rating: 4.5,
      price: 100,
      description: 'A test hotel for development',
      amenities: ['WiFi', 'Pool', 'Gym']
    };
    
    const createResponse = await fetch('http://localhost:3000/api/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sampleHotel)
    });
    
    console.log('Create hotel response status:', createResponse.status);
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('Create hotel response:', JSON.stringify(createResult, null, 2));
      
      if (createResult.success) {
        console.log('✅ Successfully created hotel');
        const newHotelId = createResult.hotel.id;
        
        // Test deleting the hotel
        console.log('\n4. Deleting the test hotel...');
        const deleteResponse = await fetch(`http://localhost:3000/api/hotels/${newHotelId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Delete hotel response status:', deleteResponse.status);
        
        if (deleteResponse.ok) {
          const deleteResult = await deleteResponse.json();
          console.log('Delete hotel response:', JSON.stringify(deleteResult, null, 2));
          console.log('✅ Successfully deleted hotel');
        } else {
          const deleteError = await deleteResponse.text();
          console.log('❌ Hotel deletion failed:', deleteError);
        }
      }
    } else {
      const createError = await createResponse.text();
      console.log('❌ Hotel creation failed:', createError);
    }
    
  } catch (error) {
    console.error('Error testing hotels API:', error.message);
  }
}

// Run the test
testHotelsAPI();