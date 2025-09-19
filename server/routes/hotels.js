// routes/hotels.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../lib/supabase');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload hotel image
router.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }
    
    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `hotels/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('hotel-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
    
    if (error) {
      console.error('Supabase storage upload error:', error);
      
      // Check if it's a bucket not found error
      if (error.statusCode === '404' || (error.message && error.message.includes('Bucket not found'))) {
        return res.status(400).json({ 
          success: false,
          message: 'Image upload failed: Storage bucket not found. Please set up the "hotel-images" bucket in Supabase Storage.',
          error: error.message 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        message: 'Failed to upload image to storage',
        error: error.message 
      });
    }
    
    // Get public URL for the uploaded image
    try {
      const { data: { publicUrl } } = supabase
        .storage
        .from('hotel-images')
        .getPublicUrl(filePath);
      
      res.json({
        success: true,
        imageUrl: publicUrl,
        message: 'Image uploaded successfully'
      });
    } catch (urlError) {
      console.error('Error getting public URL:', urlError);
      res.json({
        success: true,
        imageUrl: '',
        message: 'Image uploaded but failed to get public URL'
      });
    }
  } catch (error) {
    console.error('Error uploading hotel image:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during image upload',
      error: error.message 
    });
  }
});

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
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      hotels: data || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit),
        totalCount: count || 0,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Server error in hotels route:', error);
    res.status(500).json({ 
      success: false,
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

// Create a new hotel (Admin only)
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

// Update a hotel (Admin only)
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

// Delete a hotel (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    
    if (isNaN(hotelId)) {
      return res.status(400).json({ 
        message: 'Invalid hotel ID' 
      });
    }
    
    const { data, error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', hotelId);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message,
        details: error.details || 'No additional details available'
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

module.exports = router;