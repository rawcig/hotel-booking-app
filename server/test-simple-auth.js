// test-simple-auth.js
// Test script to verify simple auth is working

const { loginUser, registerUser } = require('./simple-auth');

console.log('=== Testing Simple Auth System ===\n');

// Test 1: Try to login with admin user
console.log('1. Testing admin login...');
const adminLogin = loginUser('admin@example.com', 'anything');
console.log('Admin login result:', adminLogin);
console.log('');

// Test 2: Try to login with regular user
console.log('2. Testing regular user login...');
const userLogin = loginUser('user@example.com', 'anything');
console.log('User login result:', userLogin);
console.log('');

// Test 3: Try to login with invalid user
console.log('3. Testing invalid user login...');
const invalidLogin = loginUser('invalid@example.com', 'anything');
console.log('Invalid login result:', invalidLogin);
console.log('');

// Test 4: Try to register a new user
console.log('4. Testing user registration...');
const newUser = registerUser('Test User', 'test@example.com', 'password123');
console.log('New user registration result:', newUser);
console.log('');

console.log('=== Test Complete ===');