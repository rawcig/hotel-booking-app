# Push Notifications Implementation

## Overview
This document explains how push notifications are implemented in the Hotel Booking App.

## Features Implemented

### 1. Notification Service
- **File**: `services/NotificationService.ts`
- Handles all notification logic including registration, scheduling, and sending
- Supports both immediate and scheduled notifications
- Includes specific notification types:
  - Booking confirmations
  - Check-in reminders
  - Special offers

### 2. Notification Context
- **File**: `context/NotificationContext.tsx`
- Manages notification state throughout the app
- Handles permission requests
- Provides notification data to components

### 3. UI Components
- **Notification Icon**: Simple bell icon with unread indicator
- **Notifications Screen**: Displays notification history
- **Test Button**: Allows users to send test notifications

### 4. Integration Points
- **Booking Confirmation**: Automatically sends notification when booking is confirmed
- **Profile Screen**: Includes test notification button
- **Tab Navigation**: Dedicated notifications tab

## How It Works

### Registration
1. App automatically requests notification permissions on startup
2. Registers for Expo push notifications
3. Sets up notification listeners

### Sending Notifications
1. **Automatic**: Booking confirmations are sent automatically after successful booking
2. **Manual**: Users can send test notifications from the profile screen

### Receiving Notifications
1. App listens for incoming notifications
2. Displays alerts to the user
3. Updates notification badge indicators

## Testing Notifications

### From Profile Screen
1. Navigate to Profile tab
2. Tap "Send Test Notification" button
3. Notification should appear immediately

### From Code
1. Use `NotificationService.getInstance()` to access the service
2. Call methods like `sendImmediateNotification()` or `sendBookingConfirmation()`

## Dependencies
- `expo-notifications`: Core notification functionality
- `expo-device`: Device information for notification support
- React Native built-in components

## Future Enhancements
- Push notification server integration
- Rich notification content (images, actions)
- Notification categories and channels
- Analytics for notification engagement