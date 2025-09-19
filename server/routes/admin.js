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

    if (hotelsError && hotelsError.code !== 'PGRST116') {
      return res.status(500).json({
        success: false,
        message: 'Error fetching hotels count',
        error: hotelsError.message
      });
    }

    // Get total bookings count
    const { count: bookingsCount, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    if (bookingsError && bookingsError.code !== 'PGRST116') {
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

// Get bookings overview
router.get('/bookings/overview', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        hotel_name,
        guest_name,
        check_in,
        check_out,
        total_price,
        status,
        created_at
      `)
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

// Get users overview
router.get('/users/overview', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }

    res.json({
      success: true,
      users: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get booking statistics
router.get('/bookings/stats', async (req, res) => {
  try {
    // Get count of bookings by status
    const { data: allBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('status');

    if (fetchError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching booking stats',
        error: fetchError.message
      });
    }

    // Calculate statistics
    const total = allBookings.length;
    const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
    const pending = allBookings.filter(b => b.status === 'pending').length;
    const completed = allBookings.filter(b => b.status === 'completed').length;
    const cancelled = allBookings.filter(b => b.status === 'cancelled').length;

    res.json({
      success: true,
      stats: {
        total,
        confirmed,
        pending,
        completed,
        cancelled
      }
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