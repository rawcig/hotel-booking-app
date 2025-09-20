# Testing Financial Endpoints

## Overview
This document provides guidance on how to test the newly implemented financial endpoints in the hotel booking application.

## Prerequisites
1. Ensure the server is running (`npm start` in the `/server` directory)
2. Ensure you have a valid admin account with appropriate permissions
3. Have a tool for making HTTP requests (curl, Postman, etc.)

## Authentication
All financial endpoints require admin authentication. You'll need to:
1. Login as an admin user to get a JWT token
2. Include the token in the Authorization header for all requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## Endpoint Testing

### 1. Financial Summary
**Endpoint**: `GET /api/financial/summary`
**Description**: Retrieves financial summary data including total revenue, pending revenue, and revenue trends

**Test Command**:
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:3000/api/financial/summary
```

**Expected Response**:
```json
{
  "success": true,
  "summary": {
    "totalRevenue": 12500,
    "pendingRevenue": 3200,
    "cancelledRevenue": 500,
    "revenueByHotel": {
      "Grand Plaza": 8500,
      "Seaside Resort": 4000
    },
    "revenueByMonth": {
      "2025-08": 7500,
      "2025-09": 5000
    }
  }
}
```

### 2. Detailed Financial Report
**Endpoint**: `GET /api/financial/report`
**Description**: Retrieves detailed financial report with optional date filtering

**Test Command**:
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     "http://localhost:3000/api/financial/report?startDate=2025-09-01&endDate=2025-09-30"
```

**Expected Response**:
```json
{
  "success": true,
  "report": {
    "period": {
      "startDate": "2025-09-01",
      "endDate": "2025-09-30"
    },
    "totals": {
      "totalBookings": 25,
      "totalRevenue": 12500,
      "averageBookingValue": 500
    },
    "hotelPerformance": {
      "Grand Plaza": {
        "bookings": 15,
        "revenue": 8500
      },
      "Seaside Resort": {
        "bookings": 10,
        "revenue": 4000
      }
    }
  },
  "bookings": [...]
}
```

### 3. Payment Methods Breakdown
**Endpoint**: `GET /api/financial/payment-methods`
**Description**: Retrieves breakdown of bookings by payment method

**Test Command**:
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:3000/api/financial/payment-methods
```

**Expected Response**:
```json
{
  "success": true,
  "paymentMethods": {
    "Credit Card": {
      "count": 20,
      "amount": 10000
    },
    "PayPal": {
      "count": 5,
      "amount": 2500
    }
  }
}
```

### 4. Revenue Report
**Endpoint**: `GET /api/reports/revenue`
**Description**: Retrieves revenue data grouped by time period

**Test Command**:
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     "http://localhost:3000/api/reports/revenue?groupBy=month&startDate=2025-01-01&endDate=2025-12-31"
```

**Expected Response**:
```json
{
  "success": true,
  "revenue": {
    "total": 12500,
    "chartData": [
      {
        "period": "2025-08",
        "amount": 7500
      },
      {
        "period": "2025-09",
        "amount": 5000
      }
    ],
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-12-31"
    }
  }
}
```

## Error Handling Testing

### Invalid Date Parameters
**Test Command**:
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     "http://localhost:3000/api/financial/report?startDate=invalid-date"
```

**Expected Response**:
```json
{
  "success": false,
  "message": "Invalid startDate parameter"
}
```

### Unauthorized Access
**Test Command** (without valid token):
```bash
curl http://localhost:3000/api/financial/summary
```

**Expected Response**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Frontend Testing

### Admin Dashboard
1. Login as admin
2. Navigate to the admin dashboard
3. Verify that financial summary data is displayed correctly
4. Check that loading states work properly
5. Verify that the revenue trend visualization appears correctly

### Financial Reports Screen
1. From the admin dashboard, navigate to Financial Reports
2. Verify that all financial data is displayed correctly
3. Check that charts render properly
4. Verify that hotel performance data is sorted by revenue
5. Test navigation back to the dashboard

## Validation Checks

All endpoints include validation for:
- Date parameters (must be valid ISO dates)
- Numeric parameters (must be valid numbers)
- String parameters (length and format validation)
- Status parameters (must be valid booking statuses)
- GroupBy parameters (must be valid grouping options)

## Troubleshooting

### No Data Returned
- Ensure there are bookings in the database
- Check that bookings have valid status values
- Verify date ranges include existing bookings

### Authentication Errors
- Ensure you're using a valid admin JWT token
- Check that the token hasn't expired
- Verify the Authorization header format

### Server Errors
- Check server logs for detailed error messages
- Ensure the database connection is working
- Verify all required environment variables are set