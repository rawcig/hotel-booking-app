// test-booking-functionality.ts
// Comprehensive test script to verify booking creation and cancellation functionality

import { bookingsService } from '@/api/services/bookings';
import { supabase } from '@/lib/supabase';

async function testBookingFunctionality() {
  try {
    console.log('Testing booking functionality...');
    
    // Test 1: Create a test booking
    console.log('\n--- Test 1: Creating a booking ---');
    const testBooking = {
      hotel_id: 1,
      user_id: 'user-123',
      check_in: '2023-12-01',
      check_out: '2023-12-05',
      guests: 2,
      rooms: 1,
      guest_name: 'Test User',
      guest_email: 'test@example.com',
      guest_phone: '123-456-7890',
      total_price: '400',
      hotel_name: 'Test Hotel',
      location: 'Test Location',
      image: 'https://example.com/test-hotel.jpg'
    };

    console.log('Creating test booking...');
    const createdBooking = await bookingsService.createBooking(testBooking);
    console.log('✅ Booking created successfully:', createdBooking);

    // Test 2: Retrieve the booking
    console.log('\n--- Test 2: Retrieving the booking ---');
    const retrievedBooking = await bookingsService.getBookingById(createdBooking.id);
    console.log('✅ Booking retrieved successfully:', retrievedBooking);

    // Test 3: Get all bookings for user
    console.log('\n--- Test 3: Retrieving all bookings for user ---');
    const userBookings = await bookingsService.getBookings({ user_id: 'user-123' });
    console.log('✅ User bookings retrieved successfully:', userBookings);

    // Test 4: Cancel the booking
    console.log('\n--- Test 4: Cancelling the booking ---');
    console.log('Attempting to cancel booking with ID:', createdBooking.id);
    const cancelledBooking = await bookingsService.cancelBooking(createdBooking.id);
    console.log('✅ Booking cancelled successfully:', cancelledBooking);

    // Test 5: Verify the status was updated
    console.log('\n--- Test 5: Verifying booking status ---');
    if (cancelledBooking.status === 'cancelled') {
      console.log('✅ Booking cancellation test PASSED');
    } else {
      console.error('❌ Booking cancellation test FAILED: Status not updated');
    }

    // Test 6: Get booking stats
    console.log('\n--- Test 6: Retrieving booking stats ---');
    const bookingStats = await bookingsService.getBookingStats('user-123');
    console.log('✅ Booking stats retrieved successfully:', bookingStats);

    console.log('\n🎉 All booking functionality tests completed!');
  } catch (error) {
    console.error('❌ Booking functionality test FAILED with error:', error);
  }
}

// Run the test
testBookingFunctionality();