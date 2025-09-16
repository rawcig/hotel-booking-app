// routes/auth.js
const express = require('express');
const router = express.Router();
const { storeToken, removeToken } = require('../middleware/auth');

// For demo purposes, we'll use a simple authentication system
// In a real app, you would integrate with Supabase Auth or another auth system

// Mock user data (in a real app, this would come from a database)
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin'
  }
];

// Generate a simple token
function generateToken() {
  return 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo purposes, accept any non-empty email and password
    if (!email || !password) {
      return res.status(401).json({ 
        message: 'Email and password are required' 
      });
    }
    
    // Find user or create a new one for demo
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Create a new user for demo purposes
      const userId = users.length + 1;
      user = {
        id: userId,
        name: email.split('@')[0],
        email: email,
        role: 'admin'
      };
      users.push(user);
    }
    
    // Generate token
    const token = generateToken();
    storeToken(token, user.id);
    
    res.json({
      success: true,
      user: user,
      token: token
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
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists' 
      });
    }
    
    // Create new user
    const userId = users.length + 1;
    const newUser = {
      id: userId,
      name: name,
      email: email,
      role: 'admin'
    };
    users.push(newUser);
    
    // Generate token
    const token = generateToken();
    storeToken(token, newUser.id);
    
    res.status(201).json({
      success: true,
      user: newUser,
      token: token
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
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      removeToken(token);
    }
    
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error during logout',
      error: error.message 
    });
  }
});

module.exports = router;