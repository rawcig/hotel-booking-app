// services/financialService.ts
// Service for fetching financial data from the backend API

import apiService from './api';

export interface FinancialSummary {
  totalRevenue: number;
  pendingRevenue: number;
  cancelledRevenue: number;
  revenueByHotel: Record<string, number>;
  revenueByMonth: Record<string, number>;
}

export interface FinancialReport {
  period: {
    startDate?: string;
    endDate?: string;
  };
  totals: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
  };
  hotelPerformance: Record<string, {
    bookings: number;
    revenue: number;
  }>;
  bookings: any[];
}

export interface PaymentMethodsData {
  [method: string]: {
    count: number;
    amount: number;
  };
}

export interface RevenueReport {
  total: number;
  chartData: Array<{
    period: string;
    amount: number;
  }>;
  period: {
    startDate?: string;
    endDate?: string;
  };
}

class FinancialService {
  // Get financial summary
  async getFinancialSummary(): Promise<{ success: boolean; summary?: FinancialSummary; error?: string }> {
    try {
      const response = await apiService.get<FinancialSummary>('/financial/summary');
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch financial summary'
      };
    }
  }

  // Get detailed financial report
  async getFinancialReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; report?: FinancialReport; error?: string }> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const url = `/financial/report${queryString ? `?${queryString}` : ''}`;
      const response = await apiService.get<FinancialReport>(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch financial report'
      };
    }
  }

  // Get payment methods breakdown
  async getPaymentMethods(): Promise<{ success: boolean; paymentMethods?: PaymentMethodsData; error?: string }> {
    try {
      const response = await apiService.get<PaymentMethodsData>('/financial/payment-methods');
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch payment methods data'
      };
    }
  }

  // Get revenue report
  async getRevenueReport(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<{ success: boolean; revenue?: RevenueReport; error?: string }> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const url = `/reports/revenue${queryString ? `?${queryString}` : ''}`;
      const response = await apiService.get<RevenueReport>(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch revenue report'
      };
    }
  }
}

// Export singleton instance
export const financialService = new FinancialService();