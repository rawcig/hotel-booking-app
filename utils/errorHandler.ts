// utils/errorHandler.ts
// Utility functions for handling and displaying errors

import { Alert } from 'react-native';
import { analyticsService } from '@/services/analyticsService';
import { useUser } from '@/context/UserContext';

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
export const handleApiError = (error: any, operation: string = 'operation', userId?: string): void => {
  console.error(`${operation} error:`, error);
  
  // Log error to analytics
  analyticsService.logError({
    error: error.name || 'UnknownError',
    message: error.message || 'An unknown error occurred',
    stack: error.stack,
    component: operation,
    userId,
    severity: getErrorSeverity(error),
    metadata: {
      operation,
      timestamp: new Date().toISOString()
    }
  });
  
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
export const handleValidationErrors = (errors: { field: string; message: string }[], userId?: string): void => {
  if (errors.length > 0) {
    // Log validation error to analytics
    analyticsService.logError({
      error: 'ValidationError',
      message: errors[0].message,
      component: 'FormValidation',
      userId,
      severity: 'medium',
      metadata: {
        field: errors[0].field,
        timestamp: new Date().toISOString()
      }
    });
    
    Alert.alert('Validation Error', errors[0].message);
  }
};

// Display a success message
export const showSuccessMessage = (message: string, userId?: string): void => {
  // Track success events
  analyticsService.trackEvent({
    event: 'success_message',
    category: 'ui',
    action: 'displayed',
    label: message,
    userId
  });
  
  Alert.alert('Success', message);
};

// Display a confirmation dialog
export const showConfirmation = (
  title: string, 
  message: string, 
  onConfirm: () => void,
  onCancel?: () => void,
  userId?: string
): void => {
  // Track confirmation dialog events
  analyticsService.trackEvent({
    event: 'confirmation_dialog',
    category: 'ui',
    action: 'displayed',
    label: title,
    userId
  });
  
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          analyticsService.trackEvent({
            event: 'confirmation_dialog_cancelled',
            category: 'ui',
            action: 'cancelled',
            label: title,
            userId
          });
          onCancel?.();
        }
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: () => {
          analyticsService.trackEvent({
            event: 'confirmation_dialog_confirmed',
            category: 'ui',
            action: 'confirmed',
            label: title,
            userId
          });
          onConfirm();
        }
      }
    ]
  );
};

// Get error severity based on error type
const getErrorSeverity = (error: any): 'low' | 'medium' | 'high' | 'critical' => {
  if (error.name === 'NetworkError') return 'high';
  if (error.name === 'AuthenticationError') return 'high';
  if (error.code === '42501') return 'high'; // Access denied
  if (error.code === '23505') return 'medium'; // Duplicate entry
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) return 'high';
  return 'medium';
};