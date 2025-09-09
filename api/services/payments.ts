// api/services/payments.ts
import { supabase } from '@/lib/supabase';

export interface CreatePaymentRequest {
  reservation_id: number;
  amount_paid: number;
  payment_method: string;
  payment_channel: 'online' | 'front_desk';
  transaction_id?: string;
  staff_id?: number;
  notes?: string;
}

export interface Payment {
  id: number;
  reservation_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  payment_channel: 'online' | 'front_desk';
  payment_status: 'pending' | 'completed' | 'refunded' | 'failed';
  transaction_id: string | null;
  staff_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentWithDetails extends Payment {
  reservation: {
    check_in_date: string;
    check_out_date: string;
    guest: {
      first_name: string;
      last_name: string;
    };
    room: {
      room_number: string;
      price_per_night: number;
    };
  };
}

export const paymentsService = {
  // Create a new payment
  createPayment: async (data: CreatePaymentRequest): Promise<Payment> => {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        ...data,
        payment_date: new Date().toISOString().split('T')[0],
        payment_status: 'completed'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return payment as Payment;
  },

  // Get payments for a reservation
  getReservationPayments: async (reservation_id: number): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reservation_id', reservation_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as Payment[];
  },

  // Get payment by ID with details
  getPaymentById: async (id: number): Promise<PaymentWithDetails> => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        reservation:check_in_date,check_out_date,
        guest:first_name,last_name,
        room:room_number,price_per_night
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Payment not found');
    }

    return data as PaymentWithDetails;
  },

  // Refund a payment
  refundPayment: async (id: number, notes?: string): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        payment_status: 'refunded',
        notes: notes ? `${notes} (Refunded)` : 'Refunded'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Payment not found');
    }

    return data as Payment;
  },

  // Get payment statistics
  getPaymentStats: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount_paid, payment_status')
      .eq('payment_status', 'completed');

    if (error) {
      throw new Error(error.message);
    }

    const totalRevenue = data.reduce((sum, payment) => sum + payment.amount_paid, 0);
    
    return {
      totalRevenue,
      totalPayments: data.length
    };
  },
};