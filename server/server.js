// server.js
// NOTE: This is a Node.js/Express server that should be run separately from the React Native app
// It cannot be run in the React Native environment because it uses Node.js built-in modules like 'path'
// To run this server: cd server && npm start

const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin portal static files
app.use('/admin', express.static(path.resolve(__dirname, 'admin')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/auth'));  // Add this line to map /api/users to the same routes as /api/auth
app.use('/api/simple-auth', require('./routes/simple-auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/financial', require('./routes/financial'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));

// Redirect root to admin portal
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Admin portal route (serves index.html for any admin route)
app.get('/admin/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'admin', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin portal available at http://localhost:${PORT}/admin`);
});