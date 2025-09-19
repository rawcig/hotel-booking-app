// routes/rooms.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Get all rooms with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, hotel_id, room_type_id, is_active } = req.query;
    
    // Fetch rooms from Supabase
    let query = supabase.from('rooms').select(`
      *,
      room_type:room_types(*)
    `);
    
    // Apply hotel filter
    if (hotel_id) {
      query = query.eq('hotel_id', hotel_id);
    }
    
    // Apply room type filter
    if (room_type_id) {
      query = query.eq('room_type_id', room_type_id);
    }
    
    // Apply active status filter
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(startIndex, startIndex + parseInt(limit) - 1);
    
    // Order by room number
    query = query.order('room_number', { ascending: true });
    
    const { data, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      rooms: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
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

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    
    if (isNaN(roomId)) {
      return res.status(400).json({ 
        message: 'Invalid room ID' 
      });
    }
    
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_type:room_types(*)
      `)
      .eq('id', roomId)
      .single();
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        message: 'Room not found' 
      });
    }
    
    res.json({
      success: true,
      room: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Create a new room
router.post('/', async (req, res) => {
  try {
    const roomData = req.body;
    
    // Validate required fields
    if (!roomData.room_number || !roomData.hotel_id || !roomData.room_type_id) {
      return res.status(400).json({ 
        message: 'Room number, hotel ID, and room type ID are required' 
      });
    }
    
    // Set default values
    roomData.is_active = roomData.is_active !== undefined ? roomData.is_active : true;
    roomData.floor_number = roomData.floor_number || null;
    roomData.view_type = roomData.view_type || null;
    roomData.price_per_night = roomData.price_per_night || 0;
    roomData.capacity = roomData.capacity || 2;
    
    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select(`
        *,
        room_type:room_types(*)
      `)
      .single();
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.status(201).json({
      success: true,
      room: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update a room
router.put('/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const roomData = req.body;
    
    if (isNaN(roomId)) {
      return res.status(400).json({ 
        message: 'Invalid room ID' 
      });
    }
    
    // Remove id from update data
    delete roomData.id;
    
    const { data, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', roomId)
      .select(`
        *,
        room_type:room_types(*)
      `)
      .single();
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        message: 'Room not found' 
      });
    }
    
    res.json({
      success: true,
      room: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete a room
router.delete('/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    
    if (isNaN(roomId)) {
      return res.status(400).json({ 
        message: 'Invalid room ID' 
      });
    }
    
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get room types
router.get('/types', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      room_types: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Create a new room type
router.post('/types', async (req, res) => {
  try {
    const roomTypeData = req.body;
    
    // Validate required fields
    if (!roomTypeData.name) {
      return res.status(400).json({ 
        message: 'Room type name is required' 
      });
    }
    
    const { data, error } = await supabase
      .from('room_types')
      .insert([roomTypeData])
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
      room_type: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;