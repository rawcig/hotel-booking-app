// test-notifications.ts
// Test script to verify notification functionality

import NotificationService from '@/services/NotificationService';

async function testNotifications() {
  console.log('Testing notification functionality...');
  
  try {
    // Test if device supports notifications
    const isSupported = await NotificationService.isNotificationSupported();
    console.log('Device supports notifications:', isSupported);
    
    if (!isSupported) {
      console.log('Skipping notification tests - not supported on this device');
      return;
    }
    
    // Test registering for push notifications
    console.log('Registering for push notifications...');
    const token = await NotificationService.registerForPushNotificationsAsync();
    console.log('Push token:', token);
    
    // Test sending immediate notification
    console.log('Sending test notification...');
    const notificationId = await NotificationService.sendImmediateNotification(
      'Test Notification',
      'This is a test notification from the Hotel Booking App!'
    );
    console.log('Notification sent with ID:', notificationId);
    
    // Test booking confirmation notification
    console.log('Sending booking confirmation notification...');
    const bookingNotificationId = await NotificationService.sendBookingConfirmation(
      'Grand Plaza Hotel',
      '2023-12-15',
      '2023-12-18',
      12345,
      '$200'
    );
    console.log('Booking confirmation sent with ID:', bookingNotificationId);
    
    // Test check-in reminder
    console.log('Sending check-in reminder...');
    const reminderId = await NotificationService.sendCheckInReminder(
      'Seaside Resort',
      '2023-12-20',
      3
    );
    console.log('Check-in reminder sent with ID:', reminderId);
    
    // Test special offer notification
    console.log('Sending special offer notification...');
    const offerId = await NotificationService.sendSpecialOffer(
      'Weekend Getaway',
      '20%',
      '2023-12-31'
    );
    console.log('Special offer sent with ID:', offerId);
    
    console.log('✅ All notification tests completed successfully');
  } catch (error) {
    console.error('❌ Notification test failed:', error);
  }
}

// Run the test
testNotifications();