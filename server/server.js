// server.js
1// NOTE: This is a Node.js/Express server that should be run separately from the React Native app
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

// Serve admin portal static files
app.use('/admin', express.static(path.resolve(__dirname, 'admin')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/bookings', require('./routes/bookings'));

// Redirect root to admin portal
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Admin portal route (serves index.html for any admin route)
app.get('/admin/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'admin', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin portal available at http://localhost:${PORT}/admin`);
});