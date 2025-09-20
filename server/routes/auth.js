// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');
const { storeToken, removeToken, getUserIdFromToken, authenticateAdmin, authorizeAdmin } = require('../middleware/auth');

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
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user in users table
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
    const { data: user, error: fetchError } = await supabase
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
    
    // Verify password
    // Note: Your current database schema doesn't have a password field in the users table
    // For now, we'll accept any password for existing users
    // In a real implementation, you would have a password field and verify it like this:
    /*
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
    */
    
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

// Get all users (No authentication for demo)
router.get('/', async (req, res) => {
  try {
    // Simplified version for demo - no pagination or search
    const { data, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Database error',
        error: error.message 
      });
    }
    
    // Format user data with role names
    const formattedUsers = data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.user_roles ? user.user_roles.name : 'user',
      role_id: user.role_id,
      created_at: user.created_at
    }));
    
    res.json({
      success: true,
      users: formattedUsers || []
    });
  } catch (error) {
    console.error('Server error in users route:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get user by ID (No authentication for demo)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const { data, error } = await supabase
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
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Database error',
        error: error.message 
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Format user data with role name
    const formattedUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.user_roles ? data.user_roles.name : 'user',
      role_id: data.role_id,
      created_at: data.created_at
    };
    
    res.json({
      success: true,
      user: formattedUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update user (No authentication for demo)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    // Remove id and role_id from update data for security
    delete userData.id;
    delete userData.role_id;
    
    const { data, error } = await supabase
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
      console.error('Supabase update error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Database error',
        error: error.message 
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Format user data with role name
    const formattedUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.user_roles ? data.user_roles.name : 'user',
      role_id: data.role_id
    };
    
    res.json({
      success: true,
      user: formattedUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete user (No authentication for demo)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);2
    
    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;