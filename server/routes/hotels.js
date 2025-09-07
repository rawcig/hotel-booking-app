// routes/hotels.js
const express = require('express');
const router = express.Router();

// Import hotel data from the frontend app
const { hotels } = require('../data/hotels');

// Get all hotels with pagination and filtering
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    
    let filteredHotels = [...hotels];
    
    // Apply search filter
    if (search) {
      const query = search.toLowerCase();
      filteredHotels = filteredHotels.filter(hotel => 
        hotel.name.toLowerCase().includes(query) ||
        hotel.location.toLowerCase().includes(query) ||
        hotel.amenities.some(amenity => amenity.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (category) {
      switch (category) {
        case 'Popular':
          filteredHotels = filteredHotels.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'Recommended':
          filteredHotels = filteredHotels.filter(hotel => parseFloat(hotel.rating) >= 4.5)
            .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'Nearby':
          filteredHotels = filteredHotels.sort((a, b) => {
            const distanceA = parseFloat(a.distance.replace(' km away', ''));
            const distanceB = parseFloat(b.distance.replace(' km away', ''));
            return distanceA - distanceB;
          });
          break;
        case 'Latest':
          filteredHotels = filteredHotels.reverse();
          break;
      }
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHotels = filteredHotels.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      hotels: paginatedHotels.map((hotel, index) => ({
        ...hotel,
        id: startIndex + index
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredHotels.length / limit),
        totalCount: filteredHotels.length,
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
router.get('/:id', (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    
    if (isNaN(hotelId) || hotelId < 0 || hotelId >= hotels.length) {
      return res.status(404).json({ 
        message: 'Hotel not found' 
      });
    }
    
    const hotel = {
      ...hotels[hotelId],
      id: hotelId
    };
    
    res.json({
      success: true,
      hotel
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Search hotels
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }
    
    const query = q.toLowerCase();
    const results = hotels.filter(hotel => 
      hotel.name.toLowerCase().includes(query) ||
      hotel.location.toLowerCase().includes(query) ||
      hotel.amenities.some(amenity => amenity.toLowerCase().includes(query))
    ).map((hotel, index) => ({
      ...hotel,
      id: index
    }));
    
    res.json({
      success: true,
      hotels: results
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get featured hotels
router.get('/featured', (req, res) => {
  try {
    // Return top-rated hotels
    const featuredHotels = hotels
      .filter(hotel => parseFloat(hotel.rating) >= 4.5)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 5)
      .map((hotel, index) => ({
        ...hotel,
        id: index
      }));
    
    res.json({
      success: true,
      hotels: featuredHotels
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;