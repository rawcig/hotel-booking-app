1// routes/reports.js
// Reporting routes for admin dashboard

const express = require('express');
const router = express.Router();
const { authenticateAdmin, authorizeAdmin } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

// Apply authentication middleware to all routes
router.use(authenticateAdmin);
router.use(authorizeAdmin);

// Get bookings report
router.get('/bookings', async (req, res) => {
  try {
    const { startDate, endDate, status, hotelId } = req.query;

    // Validate query parameters
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate parameter'
      });
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate parameter'
      });
    }

    // Build query
    let query = supabase.from('bookings').select(`
      id,
      hotel_name,
      guest_name,
      check_in,
      check_out,
      total_price,
      status,
      created_at
    `);

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    if (status) {
      // Validate status parameter
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status parameter'
        });
      }
      query = query.eq('status', status);
    }
    
    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Database error fetching bookings:', bookingsError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching bookings',
        error: bookingsError.message
      });
    }

    // Validate bookings data
    if (!Array.isArray(bookings)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid data format received from database'
      });
    }

    res.json({
      success: true,
      bookings: bookings || [],
      count: bookings ? bookings.length : 0
    });
  } catch (error) {
    console.error('Server error in bookings report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get hotels report
router.get('/hotels', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit parameter. Must be a number between 1 and 1000'
      });
    }

    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select(`
        id,
        name,
        location,
        rating,
        price,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limitNum);

    if (hotelsError) {
      console.error('Database error fetching hotels:', hotelsError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching hotels',
        error: hotelsError.message
      });
    }

    // Validate hotels data
    if (!Array.isArray(hotels)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid data format received from database'
      });
    }

    res.json({
      success: true,
      hotels: hotels || [],
      count: hotels ? hotels.length : 0
    });
  } catch (error) {
    console.error('Server error in hotels report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get users report
router.get('/users', async (req, res) => {
  try {
    const { startDate, endDate, roleId } = req.query;

    // Validate query parameters
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate parameter'
      });
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate parameter'
      });
    }

    // Build query
    let query = supabase.from('users').select(`
      id,
      name,
      email,
      phone,
      created_at,
      role_id
    `);

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    if (roleId) {
      // Validate roleId parameter
      const roleIdNum = parseInt(roleId);
      if (isNaN(roleIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid roleId parameter'
        });
      }
      query = query.eq('role_id', roleIdNum);
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('Database error fetching users:', usersError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: usersError.message
      });
    }

    // Validate users data
    if (!Array.isArray(users)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid data format received from database'
      });
    }

    res.json({
      success: true,
      users: users || [],
      count: users ? users.length : 0
    });
  } catch (error) {
    console.error('Server error in users report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get revenue report
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    // Validate query parameters
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate parameter'
      });
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate parameter'
      });
    }

    // Validate groupBy parameter
    const validGroupBy = ['day', 'week', 'month'];
    if (groupBy && !validGroupBy.includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid groupBy parameter. Must be one of: day, week, month'
      });
    }

    // Build query for bookings
    let query = supabase.from('bookings').select(`
      id,
      total_price,
      status,
      created_at
    `);

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Only get completed bookings for revenue
    query = query.eq('status', 'completed');

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Database error fetching bookings:', bookingsError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching bookings',
        error: bookingsError.message
      });
    }

    // Validate bookings data
    if (!Array.isArray(bookings)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid data format received from database'
      });
    }

    // Group revenue by period
    const revenueData = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.created_at);
      // Validate date
      if (isNaN(date.getTime())) return;
      
      let periodKey;
      
      switch (groupBy) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          // Get week number
          const week = Math.ceil(date.getDate() / 7);
          periodKey = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!revenueData[periodKey]) {
        revenueData[periodKey] = 0;
      }
      
      const price = parseFloat(booking.total_price);
      revenueData[periodKey] += isNaN(price) ? 0 : price;
    });

    // Convert to array for charting
    const chartData = Object.entries(revenueData).map(([period, amount]) => ({
      period,
      amount
    }));

    res.json({
      success: true,
      revenue: {
        total: bookings.reduce((sum, booking) => {
          const price = parseFloat(booking.total_price);
          return sum + (isNaN(price) ? 0 : price);
        }, 0),
        chartData,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Server error in revenue report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;