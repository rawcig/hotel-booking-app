// api/services/paymentProcessing.ts
// Simple payment processing service for the hotel booking app

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  amount: number;
  currency: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  error?: string;
}

export class PaymentProcessingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'PaymentProcessingError';
  }
}

export const paymentProcessingService = {
  // Process a credit card payment (simulated)
  processCreditCardPayment: async (paymentDetails: PaymentDetails): Promise<PaymentResult> => {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate card number (basic check)
      if (!paymentDetails.cardNumber || paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
        throw new PaymentProcessingError('Invalid card number', 'INVALID_CARD');
      }
      
      // Validate expiry date
      if (!paymentDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
        throw new PaymentProcessingError('Invalid expiry date', 'INVALID_EXPIRY');
      }
      
      // Validate CVC
      if (!paymentDetails.cvc || paymentDetails.cvc.length < 3) {
        throw new PaymentProcessingError('Invalid CVC', 'INVALID_CVC');
      }
      
      // Simulate successful payment (in a real app, this would call a payment gateway API)
      const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      return {
        success: true,
        transactionId,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      if (error instanceof PaymentProcessingError) {
        return {
          success: false,
          error: error.message,
          message: `Payment failed: ${error.message}`
        };
      } else {
        return {
          success: false,
          error: 'UNKNOWN_ERROR',
          message: 'Payment processing failed due to an unexpected error'
        };
      }
    }
  },

  // Process PayPal payment (simulated)
  processPayPalPayment: async (amount: number, currency: string): Promise<PaymentResult> => {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful PayPal payment
      const transactionId = `pp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      return {
        success: true,
        transactionId,
        message: 'PayPal payment processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'PAYPAL_ERROR',
        message: 'PayPal payment processing failed'
      };
    }
  },

  // Process cash payment (simulated - always successful)
  processCashPayment: async (amount: number, currency: string): Promise<PaymentResult> => {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Cash payments are always successful in this simulation
      const transactionId = `cash_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      return {
        success: true,
        transactionId,
        message: 'Cash payment method selected successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'CASH_ERROR',
        message: 'Failed to process cash payment selection'
      };
    }
  },

  // Validate payment method
  validatePaymentMethod: (method: string): boolean => {
    return ['card', 'paypal', 'cash'].includes(method);
  }
};