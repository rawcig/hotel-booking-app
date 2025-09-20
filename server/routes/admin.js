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
    const { month, year } = req.query;
    
    // Build query for bookings
    let bookingsQuery = supabase.from('bookings').select('total_price, status');
    
    // Apply month/year filter if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1); // month is 0-indexed in JS Date
      const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of the month
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();
      
      bookingsQuery = bookingsQuery.gte('created_at', startDateString).lte('created_at', endDateString);
    } else if (year) {
      // Filter by entire year
      const startDate = new Date(parseInt(year), 0, 1); // Jan 1st
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59); // Dec 31st
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();
      
      bookingsQuery = bookingsQuery.gte('created_at', startDateString).lte('created_at', endDateString);
    }

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

    // Get total bookings count (with filter if applicable)
    let bookingsCountQuery = supabase.from('bookings').select('*', { count: 'exact', head: true });
    
    // Apply the same date filters to bookings count
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();
      
      bookingsCountQuery = bookingsCountQuery.gte('created_at', startDateString).lte('created_at', endDateString);
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();
      
      bookingsCountQuery = bookingsCountQuery.gte('created_at', startDateString).lte('created_at', endDateString);
    }
    
    const { count: bookingsCount, error: bookingsError } = await bookingsCountQuery;

    if (bookingsError && bookingsError.code !== 'PGRST116') {
      return res.status(500).json({
        success: false,
        message: 'Error fetching bookings count',
        error: bookingsError.message
      });
    }

    // Get total revenue (sum of total_price from completed bookings)
    const { data: revenueData, error: revenueError } = await bookingsQuery;

    let totalRevenue = 0;
    let pendingRevenue = 0;
    
    if (revenueData) {
      // Calculate total revenue from completed bookings
      totalRevenue = revenueData
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
      
      // Calculate pending revenue from confirmed/pending bookings
      pendingRevenue = revenueData
        .filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
        .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
    }

    if (revenueError) {
      console.warn('Warning: Error fetching revenue data:', revenueError.message);
    }

    // Get recent bookings (last 5) with date filter
    let recentBookingsQuery = supabase
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
      .limit(5);
      
    // Apply date filter to recent bookings
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();
      
      recentBookingsQuery = recentBookingsQuery.gte('created_at', startDateString).lte('created_at', endDateString);
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();
      
      recentBookingsQuery = recentBookingsQuery.gte('created_at', startDateString).lte('created_at', endDateString);
    }

    const { data: recentBookings, error: recentBookingsError } = await recentBookingsQuery;

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
        bookings: bookingsCount || 0,
        totalRevenue: totalRevenue || 0,
        pendingRevenue: pendingRevenue || 0
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