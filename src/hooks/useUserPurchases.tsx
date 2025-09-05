import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPurchase {
  id: string;
  user_id: string;
  item_type: 'program' | 'tool';
  item_id: string;
  order_id?: string;
  amount_paid: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  access_granted_at?: string;
  created_at: string;
  updated_at: string;
}

export const useUserPurchases = () => {
  const { userProfile } = useAuth();
  const [programPurchases, setProgramPurchases] = useState<UserPurchase[]>([]);
  const [toolPurchases, setToolPurchases] = useState<UserPurchase[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Fetch program purchases
      const { data: programs, error: programError } = await supabase
        .from('individual_purchases')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (programError) throw programError;

      // Fetch tool purchases
      const { data: tools, error: toolError } = await supabase
        .from('tool_purchases')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (toolError) throw toolError;

      // Fetch enrollments to check for completed enrollments
      const { data: enrollmentsData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (enrollmentError) throw enrollmentError;

      // Transform to unified format
      const programPurchasesList: UserPurchase[] = (programs || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        item_type: 'program' as const,
        item_id: p.program_id,
        order_id: p.order_id,
        amount_paid: p.amount_paid,
        status: p.status as 'pending' | 'completed' | 'failed' | 'refunded',
        transaction_id: p.transaction_id,
        access_granted_at: p.access_granted_at,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      const toolPurchasesList: UserPurchase[] = (tools || []).map(t => ({
        id: t.id,
        user_id: t.user_id,
        item_type: 'tool' as const,
        item_id: t.tool_id,
        order_id: t.order_id,
        amount_paid: t.amount_paid,
        status: t.status as 'pending' | 'completed' | 'failed' | 'refunded',
        transaction_id: t.transaction_id,
        access_granted_at: t.access_granted_at,
        created_at: t.created_at,
        updated_at: t.updated_at
      }));

      setProgramPurchases(programPurchasesList);
      setToolPurchases(toolPurchasesList);
      setEnrollments(enrollmentsData || []);

    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [userProfile]);

  const isPurchased = (itemType: 'program' | 'tool', itemId: string): boolean => {
    console.log('Checking purchase status for:', itemType, itemId);
    
    const purchases = itemType === 'program' ? programPurchases : toolPurchases;
    const hasPurchase = purchases.some(purchase => 
      purchase.item_id === itemId && 
      purchase.status === 'completed'
    );
    
    console.log('Program purchases:', programPurchases);
    console.log('Has purchase in purchases table:', hasPurchase);
    
    // For programs, also check enrollments table for successful enrollments
    if (itemType === 'program' && !hasPurchase) {
      const hasEnrollment = checkEnrollmentStatus(itemId);
      console.log('Has enrollment:', hasEnrollment);
      console.log('All enrollments:', enrollments);
      return hasEnrollment;
    }
    
    return hasPurchase;
  };

  const checkEnrollmentStatus = (programId: string): boolean => {
    return enrollments.some(enrollment => {
      const match = enrollment.course_id === programId;
      console.log(`Checking enrollment ${enrollment.id}: course_id=${enrollment.course_id}, status=${enrollment.status}, matches=${match}`);
      return match && (enrollment.status === 'completed' || enrollment.status === 'active' || enrollment.status === 'enrolled');
    });
  };

  const getPurchase = (itemType: 'program' | 'tool', itemId: string): UserPurchase | undefined => {
    const purchases = itemType === 'program' ? programPurchases : toolPurchases;
    return purchases.find(purchase => 
      purchase.item_id === itemId && 
      purchase.status === 'completed'
    );
  };

  const getAllPurchases = (): UserPurchase[] => {
    return [...programPurchases, ...toolPurchases].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount / 100);
  };

  return {
    programPurchases,
    toolPurchases,
    loading,
    refetch: fetchPurchases,
    isPurchased,
    getPurchase,
    getAllPurchases,
    formatAmount
  };
};