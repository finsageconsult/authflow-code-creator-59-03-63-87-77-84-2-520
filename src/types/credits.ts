export type CreditType = 'SESSION_1_1' | 'WEBINAR';
export type OwnerType = 'ORG' | 'USER';

export interface CreditWallet {
  id: string;
  owner_type: OwnerType;
  owner_id: string;
  credit_type: CreditType;
  balance: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  wallet_id: string;
  delta: number;
  reason: string;
  booking_id?: string;
  created_at: string;
  created_by?: string;
}

export interface CreditAllocationRule {
  id: string;
  organization_id: string;
  credit_type: CreditType;
  amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  target_role: 'EMPLOYEE' | 'ALL';
  is_active: boolean;
}

export interface CreditBalance {
  credit_type: CreditType;
  balance: number;
  expires_at?: string;
}