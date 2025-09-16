// test-notifications.js
// Simple test script to verify push notifications are working

import NotificationService from './services/NotificationService';

async function testNotifications() {
  console.log('Testing push notifications...');
  
  // Test registering for push notifications
  const token = await NotificationService.registerForPushNotificationsAsync();
  console.log('Push token:', token);
  
  // Test sending a local notification
  const notificationId = await NotificationService.sendImmediateNotification(
    'Test Notification',
    'This is a test notification from the Hotel Booking app'
  );
  console.log('Scheduled notification ID:', notificationId);
  
  console.log('Test completed');
}

testNotifications().catch(console.error);