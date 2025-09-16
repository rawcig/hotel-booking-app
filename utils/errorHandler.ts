// utils/errorHandler.ts
// Utility functions for handling and displaying errors

import { Alert } from 'react-native';

// Custom error types
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Handle errors and display user-friendly messages
export const handleApiError = (error: any, operation: string = 'operation'): void => {
  console.error(`${operation} error:`, error);
  
  let title = 'Error';
  let message = 'An unexpected error occurred. Please try again.';
  
  // Handle different types of errors
  if (error.name === 'NetworkError' || 
      (error.message && (error.message.includes('Network Error') || error.message.includes('Failed to fetch')))) {
    title = 'Network Error';
    message = 'Please check your internet connection and try again.';
  } else if (error.name === 'ValidationError') {
    title = 'Validation Error';
    message = error.message;
  } else if (error.name === 'AuthenticationError') {
    title = 'Authentication Error';
    message = 'Please log in again.';
  } else if (error.code === '42501') {
    title = 'Access Denied';
    message = 'You do not have permission to perform this action.';
  } else if (error.code === '23505') {
    title = 'Duplicate Entry';
    message = 'This item already exists.';
  } else if (error.message) {
    // Use the error message if available
    message = error.message;
  }
  
  Alert.alert(title, message);
};

// Handle multiple validation errors
export const handleValidationErrors = (errors: { field: string; message: string }[]): void => {
  if (errors.length > 0) {
    Alert.alert('Validation Error', errors[0].message);
  }
};

// Display a success message
export const showSuccessMessage = (message: string): void => {
  Alert.alert('Success', message);
};

// Display a confirmation dialog
export const showConfirmation = (
  title: string, 
  message: string, 
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: onConfirm
      }
    ]
  );
};