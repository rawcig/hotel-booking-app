// middleware/auth.js
// Authentication and authorization middleware

const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');

// In-memory token storage (in a real app, use a database or Redis)
const tokens = new Map();

// Authenticate user with JWT token
async function authenticateUser(req, res, next) {
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
    
    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Attach user info to request
    req.user = decoded;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message
    });
  }
}

// Authorize admin user (check if user has admin role)
async function authorizeAdmin(req, res, next) {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', req.userId)
      .single();
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user role.',
        error: error.message
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    // Check if user has admin role (role_id = 1)
    if (user.role_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authorization.',
      error: error.message
    });
  }
}

// Store token (for login)
function storeToken(token, userId) {
  tokens.set(token, userId);
}

// Remove token (for logout)
function removeToken(token) {
  tokens.delete(token);
}

// Get user ID from token
function getUserIdFromToken(token) {
  return tokens.get(token);
}

// Authenticate admin (combination of authenticateUser and authorizeAdmin)
async function authenticateAdmin(req, res, next) {
  // First authenticate user
  await authenticateUser(req, res, () => {
    // Then authorize admin
    authorizeAdmin(req, res, next);
  });
}

module.exports = {
  authenticateUser,
  authenticateAdmin,
  authorizeAdmin,
  storeToken,
  removeToken,
  getUserIdFromToken
};