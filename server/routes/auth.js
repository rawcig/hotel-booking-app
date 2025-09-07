// routes/auth.js
const express = require('express');
const router = express.Router();

// Mock user data (in a real app, this would come from a database)
const users = [
  {
    id: 1,
    name: 'John Daro',
    email: 'john.daro@email.com',
    password: '$2a$10$xyz', // This would be a hashed password
    phone: '+1234567890'
  }
];

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In a real app, you would validate credentials against database
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    // In a real app, you would verify the password
    // For now, we'll just check if password is provided
    if (!password) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate a mock JWT token
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Signup endpoint
router.post('/signup', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // In a real app, you would check if user already exists
    // and hash the password before saving to database
    
    // Generate a mock user ID
    const userId = users.length + 1;
    
    // Add user to mock data (in real app, save to database)
    const newUser = {
      id: userId,
      name,
      email,
      password: '$2a$10$xyz', // This would be a hashed password
      phone
    };
    
    users.push(newUser);
    
    // Generate a mock JWT token
    const token = 'mock-jwt-token-' + Date.now();
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real app, you would invalidate the token
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

module.exports = router;