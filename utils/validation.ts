// utils/validation.ts
// Utility functions for form validation and input sanitization

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Email validation - less strict
export const validateEmail = (email: string): boolean => {
  // Basic check - just need something with @ and some characters
  return email.includes('@') && email.length > 3;
};

// Phone validation (international format)
export const validatePhone = (phone: string): boolean => {
  // Allow common phone number formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Name validation - less strict
export const validateName = (name: string): boolean => {
  // Allow most characters but require at least 1 non-whitespace character
  return name.trim().length >= 1;
};

// Guest count validation
export const validateGuests = (guests: string): boolean => {
  const guestsNum = parseInt(guests, 10);
  return !isNaN(guestsNum) && guestsNum > 0 && guestsNum <= 20;
};

// Room count validation
export const validateRooms = (rooms: string): boolean => {
  const roomsNum = parseInt(rooms, 10);
  return !isNaN(roomsNum) && roomsNum > 0 && roomsNum <= 10;
};

// Date validation
export const validateDates = (checkIn: Date, checkOut: Date): boolean => {
  // Check that check-out is after check-in
  if (checkOut <= checkIn) return false;
  
  // Check that dates are not too far in the future (max 2 years)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  if (checkIn > maxDate || checkOut > maxDate) return false;
  
  // Check that dates are not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkIn < today) return false;
  
  return true;
};

// Comprehensive form validation - completely unrestricted
export const validateBookingForm = (formData: {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guests: string;
  rooms: string;
  checkInDate: Date;
  checkOutDate: Date;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate guest name - completely unrestricted except empty
  if (!formData.guestName.trim()) {
    errors.push(new ValidationError('guestName', 'Please enter guest name'));
  }
  
  // Validate email - completely unrestricted except empty
  if (!formData.guestEmail.trim()) {
    errors.push(new ValidationError('guestEmail', 'Please enter email address'));
  }
  
  // Validate phone - completely unrestricted except empty
  if (!formData.guestPhone.trim()) {
    errors.push(new ValidationError('guestPhone', 'Please enter phone number'));
  }
  
  // Validate guests - completely unrestricted except empty
  if (!formData.guests.trim()) {
    errors.push(new ValidationError('guests', 'Please enter number of guests'));
  }
  
  // Validate rooms - completely unrestricted except empty
  if (!formData.rooms.trim()) {
    errors.push(new ValidationError('rooms', 'Please enter number of rooms'));
  }
  
  // Validate dates - completely unrestricted except empty
  if (!validateDates(formData.checkInDate, formData.checkOutDate)) {
    errors.push(new ValidationError('dates', 'Please select valid check-in and check-out dates'));
  }
  
  return errors;
};

// Profile form validation
export const validateProfileForm = (formData: {
  name: string;
  email: string;
  phone: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate name
  if (!formData.name.trim()) {
    errors.push(new ValidationError('name', 'Please enter your name'));
  } else if (!validateName(formData.name)) {
    errors.push(new ValidationError('name', 'Please enter a valid name'));
  }
  
  // Validate email
  if (!formData.email.trim()) {
    errors.push(new ValidationError('email', 'Please enter your email'));
  } else if (!validateEmail(formData.email)) {
    errors.push(new ValidationError('email', 'Please enter a valid email address'));
  }
  
  // Validate phone (optional but if provided, must be valid)
  if (formData.phone.trim() && !validatePhone(formData.phone)) {
    errors.push(new ValidationError('phone', 'Please enter a valid phone number'));
  }
  
  return errors;
};

// Login form validation
export const validateLoginForm = (formData: {
  email: string;
  password: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate email - just check if it's not empty
  if (!formData.email.trim()) {
    errors.push(new ValidationError('email', 'Please enter your email'));
  }
  
  // Validate password - just check if it's not empty
  if (!formData.password) {
    errors.push(new ValidationError('password', 'Please enter your password'));
  }
  
  return errors;
};

// Signup form validation - completely unrestricted
export const validateSignupForm = (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate name - just check if it's not empty
  if (!formData.name.trim()) {
    errors.push(new ValidationError('name', 'Please enter your name'));
  }
  
  // Validate email - just check if it's not empty
  if (!formData.email.trim()) {
    errors.push(new ValidationError('email', 'Please enter your email'));
  }
  
  // Validate password - just check if it's not empty
  if (!formData.password) {
    errors.push(new ValidationError('password', 'Please enter a password'));
  }
  
  // Validate confirm password
  if (!formData.confirmPassword) {
    errors.push(new ValidationError('confirmPassword', 'Please confirm your password'));
  } else if (formData.password !== formData.confirmPassword) {
    errors.push(new ValidationError('confirmPassword', 'Passwords do not match'));
  }
  
  return errors;
};

// Comprehensive input sanitization to prevent XSS and other issues
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Remove JavaScript events and script tags
    .replace(/(javascript:|on\w+\s*=)/gi, '')
    // Remove potentially dangerous characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim();
};

// Sanitize email - less restrictive
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Basic email sanitization
  return email.trim().toLowerCase();
};

// Sanitize phone number
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Keep only digits, +, -, (, ), and spaces
  return phone.replace(/[^0-9+\-\(\)\s]/g, '').trim();
};

// Sanitize name - less restrictive
export const sanitizeName = (name: string): string => {
  if (!name) return '';
  
  // Allow most characters but trim whitespace
  return name.trim();
};

// Sanitize number input
export const sanitizeNumber = (input: string): string => {
  if (!input) return '';
  
  // Keep only digits
  return input.replace(/[^0-9]/g, '');
};

// Comprehensive sanitization for booking data
export const sanitizeBookingData = (data: any): any => {
  return {
    ...data,
    guest_name: sanitizeName(data.guest_name),
    guest_email: sanitizeEmail(data.guest_email),
    guest_phone: sanitizePhone(data.guest_phone),
    hotel_name: sanitizeInput(data.hotel_name),
    location: sanitizeInput(data.location)
  };
};

// Comprehensive sanitization for user profile data
export const sanitizeProfileData = (data: any): any => {
  return {
    ...data,
    name: sanitizeName(data.name),
    email: sanitizeEmail(data.email),
    phone: sanitizePhone(data.phone)
  };
};