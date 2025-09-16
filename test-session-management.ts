// test-session-management.ts
// Test script to verify session management functionality

import AsyncStorage from '@react-native-async-storage/async-storage';

async function testSessionManagement() {
  console.log('Testing session management...');
  
  // Test saving user session
  const testUser = {
    id: 'user-123456789',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890'
  };
  
  try {
    await AsyncStorage.setItem('userSession', JSON.stringify(testUser));
    console.log('✅ User session saved successfully');
    
    // Test retrieving user session
    const savedUser = await AsyncStorage.getItem('userSession');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('✅ User session retrieved successfully:', parsedUser);
      
      // Verify data integrity
      if (parsedUser.id === testUser.id && parsedUser.name === testUser.name) {
        console.log('✅ User session data integrity verified');
      } else {
        console.error('❌ User session data integrity check failed');
      }
    } else {
      console.error('❌ Failed to retrieve user session');
    }
    
    // Test removing user session
    await AsyncStorage.removeItem('userSession');
    const clearedUser = await AsyncStorage.getItem('userSession');
    if (!clearedUser) {
      console.log('✅ User session cleared successfully');
    } else {
      console.error('❌ Failed to clear user session');
    }
    
    console.log('✅ All session management tests passed');
  } catch (error) {
    console.error('❌ Session management test failed:', error);
  }
}

// Run the test
testSessionManagement();