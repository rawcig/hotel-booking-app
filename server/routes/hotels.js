// routes/hotels.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Get all hotels with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    
    // Fetch hotels from Supabase
    let query = supabase.from('hotels').select('*');
    
    // Apply search filter
    if (search) {
      const queryTerm = search.toLowerCase();
      query = query.or(`name.ilike.%${queryTerm}%,location.ilike.%${queryTerm}%`);
    }
    
    // Apply category filter
    if (category) {
      switch (category) {
        case 'Popular':
          query = query.order('rating', { ascending: false });
          break;
        case 'Recommended':
          query = query.gte('rating', 4.5).order('rating', { ascending: false });
          break;
        case 'Nearby':
          // For nearby, we might need coordinates - for now, just return all
          break;
        case 'Latest':
          query = query.order('created_at', { ascending: false });
          break;
      }
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + parseInt(limit) - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      hotels: data,
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

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    
    if (isNaN(hotelId)) {
      return res.status(400).json({ 
        message: 'Invalid hotel ID' 
      });
    }
    
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId)
      .single();
    
    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message,
        details: error.details || 'No additional details available'
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        message: 'Hotel not found' 
      });
    }
    
    res.json({
      success: true,
      hotel: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Create a new hotel
router.post('/', async (req, res) => {
  try {
    const hotelData = req.body;
    
    // Validate required fields
    if (!hotelData.name || !hotelData.location) {
      return res.status(400).json({ 
        message: 'Name and location are required' 
      });
    }
    
    const { data, error } = await supabase
      .from('hotels')
      .insert([hotelData])
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
      hotel: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update a hotel
router.put('/:id', async (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    const hotelData = req.body;
    
    if (isNaN(hotelId)) {
      return res.status(400).json({ 
        message: 'Invalid hotel ID' 
      });
    }
    
    // Remove id from update data
    delete hotelData.id;
    
    const { data, error } = await supabase
      .from('hotels')
      .update(hotelData)
      .eq('id', hotelId)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message,
        details: error.details || 'No additional details available'
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        message: 'Hotel not found' 
      });
    }
    
    res.json({
      success: true,
      hotel: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete a hotel
router.delete('/:id', async (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    
    if (isNaN(hotelId)) {
      return res.status(400).json({ 
        message: 'Invalid hotel ID' 
      });
    }
    
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', hotelId);
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Search hotels
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }
    
    const queryTerm = q.toLowerCase();
    
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .or(`name.ilike.%${queryTerm}%,location.ilike.%${queryTerm}%`);
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      hotels: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get featured hotels
router.get('/featured', async (req, res) => {
  try {
    // Return top-rated hotels
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .gte('rating', 4.5)
      .order('rating', { ascending: false })
      .limit(5);
    
    if (error) {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      hotels: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;