# How to Log In as Admin

## Option 1: Using the Simple Auth System (Recommended for Testing)

Since your database has Row Level Security (RLS) enabled, the easiest way to test the admin functionality is to use the simple authentication system.

### Login Credentials:
- **Email**: `admin@example.com`
- **Password**: (Any password will work - for example: `admin123`)

### API Endpoint:
```
POST http://localhost:3000/api/simple-auth/login
```

### Example using cURL:
```bash
curl -X POST http://localhost:3000/api/simple-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Example using JavaScript/Fetch:
```javascript
fetch('http://localhost:3000/api/simple-auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  }),
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Login successful!');
    console.log('Token:', data.token);
    console.log('User:', data.user);
    // Store token for future requests
  } else {
    console.error('Login failed:', data.message);
  }
})
.catch(error => console.error('Error:', error));
```

## Option 2: Using the Web Interface

1. Make sure your server is running (`cd server && npm start`)
2. Open your browser and go to `http://localhost:3000/admin`
3. You should see a login form
4. Enter:
   - **Email**: `admin@example.com`
   - **Password**: (Any password)

## What You'll Receive After Successful Login:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Using the Token:

For subsequent requests to protected endpoints, include the token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Troubleshooting:

If you're still having issues:

1. **Make sure the server is running**: 
   ```bash
   cd server
   npm start
   ```

2. **Test the health endpoint**:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Verify the simple auth system is working**:
   ```bash
   curl http://localhost:3000/api/simple-auth/verify
   ```

The simple auth system bypasses the database RLS issues and provides a working authentication system for testing purposes.