// routes/bookings.js
const express = require('express');
const router = express.Router();

// Mock booking data (in a real app, this would come from a database)
let bookings = [
  {
    id: 1,
    hotelName: 'Grand Palace Hotel',
    location: 'Downtown',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    checkIn: '2025-09-15',
    checkOut: '2025-09-18',
    guests: 2,
    rooms: 1,
    totalPrice: '360',
    status: 'confirmed',
    bookingDate: '2025-09-01',
    guestName: 'John Daro',
    guestEmail: 'john.daro@email.com',
    guestPhone: '+1234567890'
  },
  {
    id: 2,
    hotelName: 'Ocean View Resort',
    location: 'Beachfront',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    checkIn: '2025-08-10',
    checkOut: '2025-08-12',
    guests: 1,
    rooms: 1,
    totalPrice: '178',
    status: 'completed',
    bookingDate: '2025-07-25',
    guestName: 'John Daro',
    guestEmail: 'john.daro@email.com',
    guestPhone: '+1234567890'
  }
];

// Get all bookings for current user
router.get('/', (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filteredBookings = [...bookings];
    
    // Apply status filter
    if (status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      bookings: paginatedBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredBookings.length / limit),
        totalCount: filteredBookings.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get booking by ID
router.get('/:id', (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Create a new booking
router.post('/', (req, res) => {
  try {
    const {
      hotelId,
      checkIn,
      checkOut,
      guests,
      rooms,
      guestName,
      guestEmail,
      guestPhone
    } = req.body;
    
    // In a real app, you would fetch hotel details from database
    // For now, we'll use mock data
    const hotels = require('../data/hotels').hotels;
    const hotel = hotels[hotelId];
    
    if (!hotel) {
      return res.status(404).json({ 
        message: 'Hotel not found' 
      });
    }
    
    // Calculate total price (mock implementation)
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 3600 * 24));
    const totalPrice = parseFloat(hotel.price) * nights * rooms;
    
    // Generate new booking ID
    const newBookingId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    
    // Create new booking
    const newBooking = {
      id: newBookingId,
      hotelName: hotel.name,
      location: hotel.location,
      image: hotel.image,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      rooms: parseInt(rooms),
      totalPrice: totalPrice.toString(),
      status: 'confirmed',
      bookingDate: new Date().toISOString().split('T')[0],
      guestName,
      guestEmail,
      guestPhone
    };
    
    bookings.push(newBooking);
    
    res.status(201).json({
      success: true,
      booking: newBooking
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Cancel a booking
router.put('/:id/cancel', (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }
    
    // Update booking status
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      status: 'cancelled'
    };
    
    res.json({
      success: true,
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get booking statistics
router.get('/stats', (req, res) => {
  try {
    const total = bookings.length;
    const upcoming = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    res.json({
      success: true,
      stats: {
        total,
        upcoming,
        completed,
        cancelled
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;