// test-booking-cancellation.ts
// Test script to verify booking cancellation functionality

import { bookingsService } from '@/api/services/bookings';
import { supabase } from '@/lib/supabase';

async function testBookingCancellation() {
  try {
    console.log('Testing booking cancellation...');
    
    // First, create a test booking
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
      status: 'confirmed',
      hotel_name: 'Test Hotel',
      location: 'Test Location',
      image: 'https://example.com/test-hotel.jpg'
    };

    const { data: createdBooking, error: createError } = await supabase
      .from('bookings')
      .insert([testBooking])
      .select()
      .single();

    if (createError) {
      console.error('Error creating test booking:', createError);
      return;
    }

    console.log('Created test booking:', createdBooking);

    // Now test cancellation
    console.log('Attempting to cancel booking with ID:', createdBooking.id);
    const cancelledBooking = await bookingsService.cancelBooking(createdBooking.id);
    console.log('Successfully cancelled booking:', cancelledBooking);

    // Verify the status was updated
    if (cancelledBooking.status === 'cancelled') {
      console.log('✅ Booking cancellation test PASSED');
    } else {
      console.error('❌ Booking cancellation test FAILED: Status not updated');
    }
  } catch (error) {
    console.error('❌ Booking cancellation test FAILED with error:', error);
  }
}

// Run the test
testBookingCancellation();