import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PrivacyConsent {
  id: string;
  consent_type: 'terms' | 'privacy' | 'marketing' | 'analytics';
  consent_given: boolean;
  consent_version: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
}

export const usePrivacyConsent = () => {
  const { userProfile } = useAuth();
  const [consents, setConsents] = useState<PrivacyConsent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsents = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('privacy_consents')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsents((data || []) as PrivacyConsent[]);
    } catch (error) {
      console.error('Error fetching privacy consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordConsent = async (
    consentType: PrivacyConsent['consent_type'],
    consentGiven: boolean,
    consentVersion: string = '1.0'
  ) => {
    if (!userProfile) return { error: 'User not authenticated' };

    try {
      // Log security event
      await logSecurityEvent('consent_recorded', {
        consent_type: consentType,
        consent_given: consentGiven,
        consent_version: consentVersion
      });

      const { data, error } = await supabase
        .from('privacy_consents')
        .upsert({
          user_id: userProfile.id,
          consent_type: consentType,
          consent_given: consentGiven,
          consent_version: consentVersion,
          ip_address: await getUserIP(),
          user_agent: navigator.userAgent
        }, {
          onConflict: 'user_id,consent_type,consent_version'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setConsents(prev => {
        const filtered = prev.filter(c => 
          !(c.consent_type === consentType && c.consent_version === consentVersion)
        );
        return [data as PrivacyConsent, ...filtered];
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error recording consent:', error);
      return { data: null, error: error.message };
    }
  };

  const getConsentStatus = (consentType: PrivacyConsent['consent_type'], version: string = '1.0') => {
    const consent = consents.find(c => 
      c.consent_type === consentType && c.consent_version === version
    );
    return consent?.consent_given || false;
  };

  const logSecurityEvent = async (eventType: string, eventDetails: any) => {
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_user_id: userProfile?.id,
        p_event_details: eventDetails,
        p_ip_address: await getUserIP(),
        p_user_agent: navigator.userAgent,
        p_success: true,
        p_risk_level: 'low'
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchConsents();
    }
  }, [userProfile]);

  return {
    consents,
    loading,
    recordConsent,
    getConsentStatus,
    refetch: fetchConsents,
    logSecurityEvent
  };
};