import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface IndividualProgram {
  id: string;
  title: string;
  description: string;
  category: 'course' | 'coaching';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number; // in paisa
  rating: number;
  students: number;
  content_url?: string;
  thumbnail_url?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndividualPurchase {
  id: string;
  user_id: string;
  program_id: string;
  order_id?: string;
  amount_paid: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  access_granted_at?: string;
  expires_at?: string;
  progress: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
  individual_programs: IndividualProgram;
}

export const useIndividualPrograms = () => {
  const { userProfile } = useAuth();
  const [programs, setPrograms] = useState<IndividualProgram[]>([]);
  const [purchases, setPurchases] = useState<IndividualPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('individual_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms((data || []) as IndividualProgram[]);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchPurchases = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('individual_purchases')
        .select(`
          *,
          individual_programs (*)
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases((data || []) as IndividualPurchase[]);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchPrograms(), fetchPurchases()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userProfile]);

  const formatPrice = (priceInPaisa: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(priceInPaisa / 100);
  };

  const isPurchased = (programId: string) => {
    return purchases.some(purchase => 
      purchase.program_id === programId && 
      purchase.status === 'completed'
    );
  };

  const getPurchaseByProgram = (programId: string) => {
    return purchases.find(purchase => 
      purchase.program_id === programId && 
      purchase.status === 'completed'
    );
  };

  const getFilteredPrograms = (category: 'all' | 'course' | 'coaching') => {
    if (category === 'all') return programs;
    return programs.filter(program => program.category === category);
  };

  return {
    programs,
    purchases,
    loading,
    refetch: fetchData,
    formatPrice,
    isPurchased,
    getPurchaseByProgram,
    getFilteredPrograms
  };
};