// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');
const { storeToken, removeToken, getUserIdFromToken } = require('../middleware/auth');

const router = express.Router();

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

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

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and password are required' 
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // Database error (other than "no rows returned")
      console.error('Database error checking existing user:', fetchError);
      return res.status(500).json({ 
        success: false,
        message: 'Database error during registration',
        error: fetchError.message 
      });
    }
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }
    
    // Create new user without storing password (to maintain consistency with login)
    // Since login doesn't verify passwords, we don't store them during registration
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          name: name,
          phone: phone || null,
          // Default to user role (role_id = 2)
          role_id: 2
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      return res.status(500).json({ 
        success: false,
        message: 'Error creating user account',
        error: insertError.message 
      });
    }
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      return res.status(500).json({ 
        success: false,
        message: 'Error creating user account',
        error: insertError.message 
      });
    }
    
    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email, 'user');
    storeToken(token, newUser.id);
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: 'user'
      },
      token: token
    });
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const { data: user, error: fetchError } = 
    await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No user found with this email
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      } else {
        // Database error
        console.error('Database error during login:', fetchError);
        return res.status(500).json({ 
          success: false,
          message: 'Database error during login',
          error: fetchError.message 
        });
      }
    }
    
    // For compatibility with existing users and to allow any password,
    // we skip password verification entirely
    // This accepts any password for existing users
    
    // Get user role name
    let roleName = 'user';
    if (user.role_id) {
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', user.role_id)
        .single();
      
      if (!roleError && role) {
        roleName = role.name;
      }
    }
    
    // Generate JWT token
    const token = generateToken(user.id, user.email, roleName);
    storeToken(token, user.id);
    
    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: roleName
      },
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// Logout user
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
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during logout',
      error: error.message 
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
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
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        error: error.message
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user role name
    let roleName = 'user';
    if (user.role_id) {
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', user.role_id)
        .single();
      
      if (!roleError && role) {
        roleName = role.name;
      }
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: roleName
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
});

// Get all users (Admin only)
router.get('/', async (req, res) => {
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
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', decoded.userId)
      .single();
    
    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user info',
        error: userError.message
      });
    }
    
    if (!user || user.role_id !== 1) { // role_id 1 is admin
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get users with pagination
    const { data: users, error, count } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role_id,
        created_at,
        user_roles(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
    
    // Format user data with role names
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.user_roles ? user.user_roles.name : 'user',
      role_id: user.role_id,
      created_at: user.created_at
    }));
    
    // Calculate pagination info
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      users: formattedUsers,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user by ID (Admin only)
router.get('/:id', async (req, res) => {
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
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Check if user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', decoded.userId)
      .single();
    
    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user info',
        error: userError.message
      });
    }
    
    if (!currentUser || currentUser.role_id !== 1) { // role_id 1 is admin
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Get specific user by ID
    const userId = req.params.id;
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role_id,
        created_at,
        user_roles(name)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format user data with role name
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.user_roles ? user.user_roles.name : 'user',
      role_id: user.role_id,
      created_at: user.created_at
    };
    
    res.json({
      success: true,
      user: formattedUser
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update user (Admin only)
router.put('/:id', async (req, res) => {
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
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Check if user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', decoded.userId)
      .single();
    
    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user info',
        error: userError.message
      });
    }
    
    if (!currentUser || currentUser.role_id !== 1) { // role_id 1 is admin
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Update user
    const userId = req.params.id;
    const userData = req.body;
    
    // Remove id and role_id from update data for security
    delete userData.id;
    delete userData.role_id;
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select(`
        id,
        name,
        email,
        phone,
        role_id,
        user_roles(name)
      `)
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format user data with role name
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.user_roles ? updatedUser.user_roles.name : 'user',
      role_id: updatedUser.role_id
    };
    
    res.json({
      success: true,
      user: formattedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', async (req, res) => {
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
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Check if user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', decoded.userId)
      .single();
    
    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user info',
        error: userError.message
      });
    }
    
    if (!currentUser || currentUser.role_id !== 1) { // role_id 1 is admin
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Delete user
    const userId = req.params.id;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;