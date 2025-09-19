// routes/simple-auth.js
// Simplified authentication routes for testing

const express = require('express');
const { registerUser, loginUser, verifyToken } = require('../simple-auth');

const router = express.Router();

// Register a new user
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and password are required' 
      });
    }
    
    // Register user
    const result = registerUser(name, email, password);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false,
        message: result.message 
      });
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }
    
    // Login user
    const result = loginUser(email, password);
    
    if (!result.success) {
      return res.status(401).json({ 
        success: false,
        message: result.message 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const result = verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification',
      error: error.message
    });
  }
});

module.exports = router;