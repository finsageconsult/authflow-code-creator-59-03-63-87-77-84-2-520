import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE' | 'COACH' | 'INDIVIDUAL';
  organization_id?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  created_at: string;
  updated_at: string;
}

// Sign up with email and password
export const signUp = async (email: string, password: string, name: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        name: name
      }
    }
  });
  
  return { data, error };
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

// Get user organization
export const getUserOrganization = async (organizationId: string): Promise<Organization | null> => {
  if (!organizationId) return null;
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();
    
  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
  
  return data;
};

// Update user profile
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) throw new Error('No authenticated user');
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('auth_id', user.user.id)
    .select()
    .single();
    
  return { data, error };
};

// Check if user has specific role
export const hasRole = (userProfile: UserProfile | null, roles: string[]): boolean => {
  if (!userProfile) return false;
  return roles.includes(userProfile.role);
};

// Check if user is admin
export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return hasRole(userProfile, ['ADMIN']);
};

// Check if user can manage organization
export const canManageOrganization = (userProfile: UserProfile | null): boolean => {
  return hasRole(userProfile, ['ADMIN', 'HR']);
};