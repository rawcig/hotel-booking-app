// simple-auth.js
// Simple authentication for testing without complex database setup

const jwt = require('jsonwebtoken');

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

// In-memory storage for demo purposes
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user'
  }
];

// Generate JWT token
function generateToken(userId, userEmail, userRole) {
  return jwt.sign(
    { 
      userId: userId,
      email: userEmail,
      role: userRole
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Register a new user (demo version)
function registerUser(name, email, password) {
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return { success: false, message: 'User already exists' };
  }
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    email: email,
    name: name,
    role: 'user'
  };
  
  users.push(newUser);
  
  // Generate token
  const token = generateToken(newUser.id, newUser.email, newUser.role);
  
  return {
    success: true,
    message: 'User registered successfully',
    user: newUser,
    token: token
  };
}

// Login user (demo version)
function loginUser(email, password) {
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Generate token
  const token = generateToken(user.id, user.email, user.role);
  
  return {
    success: true,
    message: 'Login successful',
    user: user,
    token: token
  };
}

// Verify token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { success: true, user: decoded };
  } catch (error) {
    return { success: false, message: 'Invalid token' };
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyToken
};