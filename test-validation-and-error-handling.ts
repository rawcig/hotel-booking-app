// test-validation-and-error-handling.ts
// Test script to verify improved error handling and validation

import { 
  validateEmail, 
  validatePhone, 
  validateName, 
  validateBookingForm, 
  validateProfileForm,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName
} from '@/utils/validation';

import { handleApiError } from '@/utils/errorHandler';

async function testValidationAndErrorHandling() {
  console.log('Testing validation and error handling...');
  
  // Test email validation
  console.log('\n--- Email Validation Tests ---');
  const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
  const invalidEmails = ['invalid.email', 'test@', '@domain.com'];
  
  validEmails.forEach(email => {
    console.log(`Valid email ${email}: ${validateEmail(email) ? 'PASS' : 'FAIL'}`);
  });
  
  invalidEmails.forEach(email => {
    console.log(`Invalid email ${email}: ${validateEmail(email) ? 'FAIL' : 'PASS'}`);
  });
  
  // Test phone validation
  console.log('\n--- Phone Validation Tests ---');
  const validPhones = ['+1234567890', '123-456-7890', '(123) 456-7890'];
  const invalidPhones = ['abc123', '12345678901234567890'];
  
  validPhones.forEach(phone => {
    console.log(`Valid phone ${phone}: ${validatePhone(phone) ? 'PASS' : 'FAIL'}`);
  });
  
  invalidPhones.forEach(phone => {
    console.log(`Invalid phone ${phone}: ${validatePhone(phone) ? 'FAIL' : 'PASS'}`);
  });
  
  // Test name validation
  console.log('\n--- Name Validation Tests ---');
  const validNames = ['John Doe', "Mary O'Connor", 'Jean-Pierre'];
  const invalidNames = ['123', 'John123', ''];
  
  validNames.forEach(name => {
    console.log(`Valid name ${name}: ${validateName(name) ? 'PASS' : 'FAIL'}`);
  });
  
  invalidNames.forEach(name => {
    console.log(`Invalid name ${name}: ${validateName(name) ? 'FAIL' : 'PASS'}`);
  });
  
  // Test form validation
  console.log('\n--- Form Validation Tests ---');
  const validBookingForm = {
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+1234567890',
    guests: '2',
    rooms: '1',
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  };
  
  const bookingErrors = validateBookingForm(validBookingForm);
  console.log(`Valid booking form: ${bookingErrors.length === 0 ? 'PASS' : 'FAIL'}`);
  
  const invalidBookingForm = {
    guestName: 'guest',
    guestEmail: 'invalid',
    guestPhone: 'abc',
    guests: '-1',
    rooms: '0',
    checkInDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    checkOutDate: new Date()
  };
  
  const invalidBookingErrors = validateBookingForm(invalidBookingForm);
  console.log(`Invalid booking form: ${invalidBookingErrors.length > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`Number of errors: ${invalidBookingErrors.length}`);
  
  // Test sanitization
  console.log('\n--- Input Sanitization Tests ---');
  const dirtyInputs = [
    '<script>alert("xss")</script>',
    'John<script>Doe</script>',
    'test@example.com<script>',
    '+123-456-7890<script>'
  ];
  
  dirtyInputs.forEach(input => {
    const sanitized = sanitizeInput(input);
    console.log(`Sanitized "${input}" to "${sanitized}"`);
  });
  
  // Test error handling
  console.log('\n--- Error Handling Tests ---');
  try {
    handleApiError(new Error('Test error'), 'test operation');
    console.log('Error handling: PASS');
  } catch (error) {
    console.log('Error handling: FAIL');
  }
  
  console.log('\n✅ All validation and error handling tests completed');
}

// Run the test
testValidationAndErrorHandling();