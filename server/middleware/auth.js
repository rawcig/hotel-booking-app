// middleware/auth.js
// Middleware to authenticate admin users

// In-memory token storage (in a real app, use a database or Redis)
const tokens = new Map();

// Authenticate admin user
function authenticateAdmin(req, res, next) {
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
    
    // Check if token exists
    if (!tokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Get user ID from token
    const userId = tokens.get(token);
    
    // Attach user ID to request for use in routes
    req.userId = userId;
    req.userToken = token;
    
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
function authorizeAdmin(req, res, next) {
  try {
    // For demo purposes, all authenticated users are admins
    // In a real app, you would check the user's role in the database
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

module.exports = {
  authenticateAdmin,
  authorizeAdmin,
  storeToken,
  removeToken,
  getUserIdFromToken
};