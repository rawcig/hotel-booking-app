// routes/admin.js
// Protected routes for admin dashboard

const express = require('express');
const router = express.Router();
const { authenticateAdmin, authorizeAdmin } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

// Apply authentication middleware to all routes
router.use(authenticateAdmin);
router.use(authorizeAdmin);

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get total hotels count
    const { count: hotelsCount, error: hotelsError } = await supabase
      .from('hotels')
      .select('*', { count: 'exact', head: true });

    if (hotelsError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching hotels count',
        error: hotelsError.message
      });
    }

    // Get total rooms count
    const { count: roomsCount, error: roomsError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true });

    if (roomsError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching rooms count',
        error: roomsError.message
      });
    }

    // Get total bookings count
    const { count: bookingsCount, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    if (bookingsError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching bookings count',
        error: bookingsError.message
      });
    }

    // Get recent bookings (last 5)
    const { data: recentBookings, error: recentBookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentBookingsError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching recent bookings',
        error: recentBookingsError.message
      });
    }

    res.json({
      success: true,
      stats: {
        hotels: hotelsCount || 0,
        rooms: roomsCount || 0,
        bookings: bookingsCount || 0
      },
      recentBookings: recentBookings || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get hotels overview
router.get('/hotels/overview', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .select('id, name, location, rating, price')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching hotels',
        error: error.message
      });
    }

    res.json({
      success: true,
      hotels: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get rooms overview
router.get('/rooms/overview', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        floor_number,
        price_per_night,
        is_active,
        room_type:room_types(name)
      `)
      .order('room_number', { ascending: true })
      .limit(10);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching rooms',
        error: error.message
      });
    }

    res.json({
      success: true,
      rooms: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get bookings overview
router.get('/bookings/overview', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, guest_name, check_in, check_out, status, total_price')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching bookings',
        error: error.message
      });
    }

    res.json({
      success: true,
      bookings: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;