import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CoachPayoutSettings {
  id: string;
  coach_id: string;
  payment_rate_per_student: number;
  payment_currency: string;
  bank_details: any;
  tax_details: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  payout_number: string;
  coach_id: string;
  period_start: string;
  period_end: string;
  total_students: number;
  payment_rate_per_student: number;
  gross_amount: number;
  tax_amount: number;
  net_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  coach?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PayoutLineItem {
  id: string;
  payout_id: string;
  enrollment_id?: string;
  purchase_id?: string;
  student_name: string;
  student_email: string;
  course_title: string;
  enrollment_date: string;
  amount: number;
  created_at: string;
}

export const usePayouts = () => {
  const { userProfile } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [coachSettings, setCoachSettings] = useState<CoachPayoutSettings[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          coach:coach_id (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts((data || []) as Payout[]);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to fetch payouts');
    }
  };

  const fetchCoachSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_payout_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoachSettings(data || []);
    } catch (error) {
      console.error('Error fetching coach settings:', error);
      toast.error('Failed to fetch coach settings');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchPayouts(), fetchCoachSettings()]);
    setLoading(false);
  };

  useEffect(() => {
    if (userProfile) {
      fetchData();
    }
  }, [userProfile]);

  const createOrUpdateCoachSettings = async (
    coachId: string,
    settings: Partial<CoachPayoutSettings>
  ) => {
    try {
      const { data, error } = await supabase
        .from('coach_payout_settings')
        .upsert({
          coach_id: coachId,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Coach settings updated successfully');
      await fetchCoachSettings();
      return data;
    } catch (error) {
      console.error('Error updating coach settings:', error);
      toast.error('Failed to update coach settings');
      throw error;
    }
  };

  const calculateCoachPayout = async (
    coachId: string,
    periodStart: string,
    periodEnd: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('calculate_coach_payout', {
        p_coach_id: coachId,
        p_period_start: periodStart,
        p_period_end: periodEnd
      });

      if (error) throw error;
      return data[0] || { total_students: 0, gross_amount: 0, enrollment_details: [] };
    } catch (error) {
      console.error('Error calculating payout:', error);
      toast.error('Failed to calculate payout');
      throw error;
    }
  };

  const generatePayout = async (
    coachId: string,
    periodStart: string,
    periodEnd: string,
    taxAmount: number = 0,
    notes?: string
  ) => {
    try {
      // First calculate the payout
      const calculation = await calculateCoachPayout(coachId, periodStart, periodEnd);
      
      if (calculation.total_students === 0) {
        toast.error('No students found for this coach in the selected period');
        return null;
      }

      // Get coach settings
      const { data: settings } = await supabase
        .from('coach_payout_settings')
        .select('*')
        .eq('coach_id', coachId)
        .single();

      if (!settings) {
        toast.error('Coach payout settings not found');
        return null;
      }

      // Generate payout number
      const { data: payoutNumber } = await supabase.rpc('generate_payout_number');

      // Create payout
      const { data: payout, error: payoutError } = await supabase
        .from('payouts')
        .insert({
          payout_number: payoutNumber,
          coach_id: coachId,
          period_start: periodStart,
          period_end: periodEnd,
          total_students: calculation.total_students,
          payment_rate_per_student: settings.payment_rate_per_student,
          gross_amount: calculation.gross_amount,
          tax_amount: taxAmount,
          net_amount: calculation.gross_amount - taxAmount,
          currency: settings.payment_currency,
          notes: notes
        })
        .select()
        .single();

      if (payoutError) throw payoutError;

      // Create line items
      const enrollmentDetails = Array.isArray(calculation.enrollment_details) ? calculation.enrollment_details : [];
      if (enrollmentDetails.length > 0) {
        const lineItems = enrollmentDetails.map((detail: any) => ({
          payout_id: payout.id,
          enrollment_id: detail.enrollment_id,
          purchase_id: detail.purchase_id,
          student_name: detail.student_name,
          student_email: detail.student_email,
          course_title: detail.course_title,
          enrollment_date: detail.enrollment_date,
          amount: detail.amount
        }));

        const { error: lineItemsError } = await supabase
          .from('payout_line_items')
          .insert(lineItems);

        if (lineItemsError) throw lineItemsError;
      }

      toast.success('Payout generated successfully');
      await fetchPayouts();
      return payout;
    } catch (error) {
      console.error('Error generating payout:', error);
      toast.error('Failed to generate payout');
      throw error;
    }
  };

  const updatePayoutStatus = async (
    payoutId: string,
    status: Payout['status'],
    paymentReference?: string
  ) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'paid') {
        updateData.payment_date = new Date().toISOString();
        if (paymentReference) {
          updateData.payment_reference = paymentReference;
        }
      }

      const { data, error } = await supabase
        .from('payouts')
        .update(updateData)
        .eq('id', payoutId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Payout status updated successfully');
      await fetchPayouts();
      return data;
    } catch (error) {
      console.error('Error updating payout status:', error);
      toast.error('Failed to update payout status');
      throw error;
    }
  };

  const getPayoutLineItems = async (payoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('payout_line_items')
        .select('*')
        .eq('payout_id', payoutId)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payout line items:', error);
      toast.error('Failed to fetch payout details');
      return [];
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return {
    payouts,
    coachSettings,
    loading,
    refetch: fetchData,
    createOrUpdateCoachSettings,
    calculateCoachPayout,
    generatePayout,
    updatePayoutStatus,
    getPayoutLineItems,
    formatCurrency,
    getStatusColor
  };
};