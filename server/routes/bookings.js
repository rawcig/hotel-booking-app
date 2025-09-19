// routes/bookings.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Get all bookings for current user
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Fetch bookings from Supabase
    let query = supabase.from('bookings').select('*');
    
    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + parseInt(limit) - 1);
    
    // Order by creation date
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      bookings: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalCount: count,
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
router.get('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ 
        message: 'Invalid booking ID' 
      });
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }
    
    res.json({
      success: true,
      booking: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      hotel_id,
      user_id,
      check_in,
      check_out,
      guests,
      rooms,
      guest_name,
      guest_email,
      guest_phone,
      total_price,
      hotel_name,
      location,
      image
    } = req.body;
    
    // Validate required fields
    if (!hotel_id || !check_in || !check_out || !guests || !rooms || !guest_name || !guest_email || !total_price) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }
    
    const newBooking = {
      hotel_id,
      user_id: user_id || 'anonymous',
      check_in,
      check_out,
      guests: parseInt(guests),
      rooms: parseInt(rooms),
      guest_name,
      guest_email,
      guest_phone: guest_phone || '',
      total_price: total_price.toString(),
      status: 'confirmed',
      hotel_name: hotel_name || '',
      location: location || '',
      image: image || ''
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([newBooking])
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.status(201).json({
      success: true,
      booking: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update a booking
router.put('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    console.log('Booking update request for ID:', req.params.id);
    console.log('Parsed bookingId:', bookingId);
    console.log('Is NaN:', isNaN(bookingId));
    
    if (isNaN(bookingId)) {
      console.log('Invalid booking ID provided:', req.params.id);
      return res.status(400).json({ 
        message: 'Invalid booking ID',
        providedId: req.params.id,
        parsedId: bookingId
      });
    }
    
    const updateData = req.body;
    console.log('Update data received:', JSON.stringify(updateData, null, 2));
    
    // Remove id from update data if present
    if (updateData.id) {
      delete updateData.id;
    }
    
    // For admin updates, we might not have user_id, so let's not require it
    // But if it's provided, we should keep it
    console.log('Sending update to Supabase:', JSON.stringify(updateData, null, 2));
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      // Let's try to get more details about the error
      return res.status(400).json({ 
        message: 'Database error during update',
        error: error.message,
        details: error.details || 'No additional details'
      });
    }
    
    if (!data) {
      console.log('Booking not found with ID:', bookingId);
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }
    
    console.log('Booking updated successfully:', JSON.stringify(data, null, 2));
    
    res.json({
      success: true,
      booking: data
    });
  } catch (error) {
    console.error('Server error updating booking:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Cancel a booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ 
        message: 'Invalid booking ID' 
      });
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }
    
    res.json({
      success: true,
      booking: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete a booking (hard delete)
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ 
        message: 'Invalid booking ID' 
      });
    }
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get booking statistics
router.get('/stats', async (req, res) => {
  try {
    // Get count of bookings by status
    const { data, error } = await supabase
      .from('bookings')
      .select('status');
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    // Calculate statistics
    const total = data.length;
    const confirmed = data.filter(b => b.status === 'confirmed').length;
    const pending = data.filter(b => b.status === 'pending').length;
    const completed = data.filter(b => b.status === 'completed').length;
    const cancelled = data.filter(b => b.status === 'cancelled').length;
    
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
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;