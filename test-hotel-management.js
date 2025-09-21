// test-hotel-management.js
// Test script to verify hotel management functionality

async function testHotelManagement() {
  try {
    console.log('Testing hotel management functionality...');
    
    // First, login to get a token
    console.log('\n1. Logging in to get auth token...');
    const loginResponse = await fetch('http://localhost:3000/api/simple-auth/login', {
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
      console.log('✅ Hotels fetch successful');
      console.log('Hotels count:', hotelsResult.hotels ? hotelsResult.hotels.length : 0);
      
      // Display hotel information
      if (hotelsResult.hotels && hotelsResult.hotels.length > 0) {
        console.log('\nHotel details:');
        hotelsResult.hotels.forEach(hotel => {
          console.log(`- ${hotel.name} (${hotel.location}) - Rating: ${hotel.rating}/5`);
        });
      }
    } else {
      const hotelsError = await hotelsResponse.text();
      console.log('❌ Hotels fetch failed:', hotelsError);
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
      console.log('✅ Hotel creation successful');
      console.log('New hotel ID:', createResult.hotel ? createResult.hotel.id : 'N/A');
      
      // Test deleting the hotel
      if (createResult.hotel && createResult.hotel.id) {
        console.log('\n4. Deleting the test hotel...');
        const deleteResponse = await fetch(`http://localhost:3000/api/hotels/${createResult.hotel.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Delete hotel response status:', deleteResponse.status);
        
        if (deleteResponse.ok) {
          const deleteResult = await deleteResponse.json();
          console.log('✅ Hotel deletion successful');
          console.log('Message:', deleteResult.message);
        } else {
          const deleteError = await deleteResponse.text();
          console.log('❌ Hotel deletion failed:', deleteError);
        }
      }
    } else {
      const createError = await createResponse.text();
      console.log('❌ Hotel creation failed:', createError);
    }
    
    console.log('\n🎉 Hotel management tests completed!');
    
  } catch (error) {
    console.error('Error testing hotel management:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// Run the test
testHotelManagement();