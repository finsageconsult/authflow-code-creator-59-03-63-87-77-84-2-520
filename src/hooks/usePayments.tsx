import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  currency: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  payment_method?: string;
  captured_at?: string;
  failure_reason?: string;
  created_at: string;
  orders: {
    order_number: string;
    service_type: string;
    quantity: number;
    user_type: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  service_type: string;
  quantity: number;
  unit_price: number;
  gst_amount: number;
  total_amount: number;
  final_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'confirmed' | 'cancelled';
  user_type: string;
  created_at: string;
  payments: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
    currency: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    payment_method?: string;
    captured_at?: string;
    failure_reason?: string;
    created_at: string;
  }>;
}

export const usePayments = () => {
  const { userProfile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            order_number,
            service_type,
            quantity,
            user_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchOrders = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          payments (
            id,
            amount,
            status,
            currency,
            razorpay_payment_id,
            razorpay_order_id,
            payment_method,
            captured_at,
            failure_reason,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchPayments(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    if (userProfile) {
      fetchData();
    }
  }, [userProfile]);

  const getPaymentStatus = (payment: Payment) => {
    switch (payment.status) {
      case 'captured':
        return { label: 'Success', color: 'text-green-600' };
      case 'authorized':
        return { label: 'Authorized', color: 'text-blue-600' };
      case 'failed':
        return { label: 'Failed', color: 'text-red-600' };
      case 'refunded':
        return { label: 'Refunded', color: 'text-purple-600' };
      default:
        return { label: 'Pending', color: 'text-yellow-600' };
    }
  };

  const getOrderStatus = (order: Order) => {
    switch (order.status) {
      case 'completed':
        return { label: 'Completed', color: 'text-green-600' };
      case 'confirmed':
        return { label: 'Confirmed', color: 'text-blue-600' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'text-gray-600' };
      case 'failed':
        return { label: 'Failed', color: 'text-red-600' };
      default:
        return { label: 'Pending', color: 'text-yellow-600' };
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount / 100);
  };

  return {
    payments,
    orders,
    loading,
    refetch: fetchData,
    getPaymentStatus,
    getOrderStatus,
    formatAmount
  };
};