import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditWallet, CreditTransaction, CreditType, OwnerType } from '@/types/credits';
import { useToast } from '@/hooks/use-toast';

const useCredits = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wallets for current user
  const { data: userWallets, isLoading: loadingUserWallets } = useQuery({
    queryKey: ['user-wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_wallets')
        .select('*')
        .eq('owner_type', 'USER');
      
      if (error) throw error;
      return data as CreditWallet[];
    }
  });

  // Fetch transactions for user wallets
  const { data: userTransactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['user-transactions'],
    queryFn: async () => {
      if (!userWallets?.length) return [];
      
      const walletIds = userWallets.map(w => w.id);
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .in('wallet_id', walletIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CreditTransaction[];
    },
    enabled: !!userWallets?.length
  });

  // Get balance for specific credit type
  const getBalance = (creditType: CreditType): number => {
    const wallet = userWallets?.find(w => w.credit_type === creditType);
    return wallet?.balance || 0;
  };

  // Consume credits (for booking)
  const consumeCredits = useMutation({
    mutationFn: async ({ walletId, amount, reason, bookingId }: {
      walletId: string;
      amount: number;
      reason: string;
      bookingId?: string;
    }) => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert([{
          wallet_id: walletId,
          delta: -amount,
          reason,
          booking_id: bookingId
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      toast({
        title: "Credits consumed",
        description: "Credits have been deducted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error consuming credits",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    userWallets,
    userTransactions,
    loadingUserWallets,
    loadingTransactions,
    getBalance,
    consumeCredits: consumeCredits.mutate
  };
};

export { useCredits };

// Hook for HR/Admin credit management
export const useCreditManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all org wallets (HR view)
  const { data: orgWallets, isLoading: loadingOrgWallets } = useQuery({
    queryKey: ['org-wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CreditWallet[];
    }
  });

  // Issue credits to organization
  const issueOrgCredits = useMutation({
    mutationFn: async ({ organizationId, creditType, amount, expiresAt }: {
      organizationId: string;
      creditType: CreditType;
      amount: number;
      expiresAt?: string;
    }) => {
      // First, create or get the org wallet
      const { data: wallet, error: walletError } = await supabase
        .from('credit_wallets')
        .upsert([{
          owner_type: 'ORG' as OwnerType,
          owner_id: organizationId,
          credit_type: creditType,
          expires_at: expiresAt
        }], {
          onConflict: 'owner_type,owner_id,credit_type'
        })
        .select()
        .single();
      
      if (walletError) throw walletError;

      // Then add the credit transaction
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert([{
          wallet_id: wallet.id,
          delta: amount,
          reason: `Admin credit issuance: ${amount} ${creditType} credits`
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-wallets'] });
      toast({
        title: "Credits issued",
        description: "Organization credits have been issued successfully."
      });
    }
  });

  // Allocate credits to employee
  const allocateCredits = useMutation({
    mutationFn: async ({ userId, creditType, amount, reason }: {
      userId: string;
      creditType: CreditType;
      amount: number;
      reason: string;
    }) => {
      // First, create or get the user wallet
      const { data: wallet, error: walletError } = await supabase
        .from('credit_wallets')
        .upsert([{
          owner_type: 'USER' as OwnerType,
          owner_id: userId,
          credit_type: creditType
        }], {
          onConflict: 'owner_type,owner_id,credit_type'
        })
        .select()
        .single();
      
      if (walletError) throw walletError;

      // Then add the credit transaction
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert([{
          wallet_id: wallet.id,
          delta: amount,
          reason
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-wallets'] });
      toast({
        title: "Credits allocated",
        description: "Employee credits have been allocated successfully."
      });
    }
  });

  return {
    orgWallets,
    loadingOrgWallets,
    issueOrgCredits: issueOrgCredits.mutate,
    allocateCredits: allocateCredits.mutate,
    isIssuingCredits: issueOrgCredits.isPending,
    isAllocatingCredits: allocateCredits.isPending
  };
};