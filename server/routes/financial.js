// routes/financial.js
// Financial management routes for admin dashboard

const express = require('express');
const router = express.Router();
const { authenticateAdmin, authorizeAdmin } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

// Apply authentication middleware to all routes
router.use(authenticateAdmin);
router.use(authorizeAdmin);

// Get financial summary
router.get('/summary', async (req, res) => {
  try {
    // Get all bookings with financial data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, total_price, status, created_at, hotel_name');

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

    // Calculate financial metrics
    const totalRevenue = bookings
      .filter(booking => booking.status === 'completed')
      .reduce((sum, booking) => {
        const price = parseFloat(booking.total_price);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

    const pendingRevenue = bookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
      .reduce((sum, booking) => {
        const price = parseFloat(booking.total_price);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

    const cancelledRevenue = bookings
      .filter(booking => booking.status === 'cancelled')
      .reduce((sum, booking) => {
        const price = parseFloat(booking.total_price);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

    // Group by hotel for revenue per hotel
    const revenueByHotel = {};
    bookings
      .filter(booking => booking.status === 'completed')
      .forEach(booking => {
        const hotel = booking.hotel_name || 'Unknown';
        if (!revenueByHotel[hotel]) {
          revenueByHotel[hotel] = 0;
        }
        const price = parseFloat(booking.total_price);
        revenueByHotel[hotel] += isNaN(price) ? 0 : price;
      });

    // Group by month for revenue trend
    const revenueByMonth = {};
    bookings
      .filter(booking => booking.status === 'completed')
      .forEach(booking => {
        const date = new Date(booking.created_at);
        // Validate date
        if (isNaN(date.getTime())) return;
        
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!revenueByMonth[monthYear]) {
          revenueByMonth[monthYear] = 0;
        }
        const price = parseFloat(booking.total_price);
        revenueByMonth[monthYear] += isNaN(price) ? 0 : price;
      });

    res.json({
      success: true,
      summary: {
        totalRevenue,
        pendingRevenue,
        cancelledRevenue,
        revenueByHotel,
        revenueByMonth
      }
    });
  } catch (error) {
    console.error('Server error in financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get detailed financial report
router.get('/report', async (req, res) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;

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

    // Build query based on period
    let query = supabase.from('bookings').select(`
      id,
      total_price,
      status,
      created_at,
      hotel_name,
      guest_name
    `);

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

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

    // Filter only completed bookings for financial report
    const completedBookings = bookings.filter(booking => booking.status === 'completed');

    // Calculate totals
    const totalBookings = completedBookings.length;
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      const price = parseFloat(booking.total_price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    // Calculate average booking value
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Group by hotel
    const hotelPerformance = {};
    completedBookings.forEach(booking => {
      const hotel = booking.hotel_name || 'Unknown';
      if (!hotelPerformance[hotel]) {
        hotelPerformance[hotel] = {
          bookings: 0,
          revenue: 0
        };
      }
      hotelPerformance[hotel].bookings += 1;
      const price = parseFloat(booking.total_price);
      hotelPerformance[hotel].revenue += isNaN(price) ? 0 : price;
    });

    res.json({
      success: true,
      report: {
        period: { startDate, endDate },
        totals: {
          totalBookings,
          totalRevenue,
          averageBookingValue
        },
        hotelPerformance
      },
      bookings: completedBookings
    });
  } catch (error) {
    console.error('Server error in financial report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get payment methods breakdown
router.get('/payment-methods', async (req, res) => {
  try {
    // Note: This assumes there's a payment_method field in bookings
    // If not, we might need to join with a payments table
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, total_price, status, payment_method');

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

    // Filter only completed bookings
    const completedBookings = bookings.filter(booking => booking.status === 'completed');

    // Group by payment method
    const paymentMethods = {};
    completedBookings.forEach(booking => {
      const method = booking.payment_method || 'Unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = {
          count: 0,
          amount: 0
        };
      }
      paymentMethods[method].count += 1;
      const price = parseFloat(booking.total_price);
      paymentMethods[method].amount += isNaN(price) ? 0 : price;
    });

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Server error in payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;