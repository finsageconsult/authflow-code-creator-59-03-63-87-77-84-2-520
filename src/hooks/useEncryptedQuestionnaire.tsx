import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Simple encryption functions (in production, use proper crypto libraries)
const encryptData = async (data: any, keyId: string = 'default'): Promise<{ encrypted: string, hash: string }> => {
  const jsonString = JSON.stringify(data);
  
  // Simple XOR encryption with timestamp (for demo - use proper encryption in production)
  const key = keyId + Date.now().toString();
  let encrypted = '';
  
  for (let i = 0; i < jsonString.length; i++) {
    encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  
  const encodedEncrypted = btoa(encrypted);
  
  // Create hash for integrity
  const encoder = new TextEncoder();
  const data_buffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data_buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { encrypted: encodedEncrypted, hash };
};

const decryptData = (encryptedData: string, keyId: string, timestamp: number): any => {
  try {
    const key = keyId + timestamp.toString();
    const encrypted = atob(encryptedData);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export interface EncryptedQuestionnaireResponse {
  id: string;
  user_id: string;
  response_data_encrypted: string;
  encryption_key_id: string;
  response_hash: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireData {
  responses: Record<string, any>;
  metadata: {
    completed_at: string;
    version: string;
    ip_address?: string;
  };
}

export const useEncryptedQuestionnaire = () => {
  const { userProfile } = useAuth();
  const [responses, setResponses] = useState<EncryptedQuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEncryptedResponses = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('encrypted_questionnaire_responses')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching encrypted responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEncryptedResponse = async (questionnaireData: QuestionnaireData) => {
    if (!userProfile) return { error: 'User not authenticated' };

    try {
      const keyId = `user_${userProfile.id}_${Date.now()}`;
      const { encrypted, hash } = await encryptData(questionnaireData, keyId);

      // Log security event for questionnaire submission
      await supabase.rpc('log_security_event', {
        p_event_type: 'questionnaire_submitted',
        p_user_id: userProfile.id,
        p_event_details: {
          response_hash: hash,
          encryption_key_id: keyId,
          version: questionnaireData.metadata.version
        },
        p_success: true,
        p_risk_level: 'low'
      });

      const { data, error } = await supabase
        .from('encrypted_questionnaire_responses')
        .insert({
          user_id: userProfile.id,
          response_data_encrypted: encrypted,
          encryption_key_id: keyId,
          response_hash: hash
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setResponses(prev => [data, ...prev]);

      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving encrypted response:', error);
      
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_event_type: 'questionnaire_save_failed',
        p_user_id: userProfile.id,
        p_event_details: { error: error.message },
        p_success: false,
        p_risk_level: 'medium'
      });

      return { data: null, error: error.message };
    }
  };

  const decryptResponse = (encryptedResponse: EncryptedQuestionnaireResponse): QuestionnaireData | null => {
    try {
      // Extract timestamp from key ID
      const keyParts = encryptedResponse.encryption_key_id.split('_');
      const timestamp = parseInt(keyParts[keyParts.length - 1]);
      
      return decryptData(
        encryptedResponse.response_data_encrypted,
        'default',
        timestamp
      );
    } catch (error) {
      console.error('Error decrypting response:', error);
      return null;
    }
  };

  const getResponseCount = () => responses.length;

  const getLatestResponse = (): QuestionnaireData | null => {
    if (responses.length === 0) return null;
    return decryptResponse(responses[0]);
  };

  // Verify data integrity
  const verifyResponseIntegrity = async (response: EncryptedQuestionnaireResponse): Promise<boolean> => {
    try {
      const decryptedData = decryptResponse(response);
      if (!decryptedData) return false;

      const encoder = new TextEncoder();
      const data_buffer = encoder.encode(JSON.stringify(decryptedData));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data_buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return computedHash === response.response_hash;
    } catch (error) {
      console.error('Error verifying integrity:', error);
      return false;
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchEncryptedResponses();
    }
  }, [userProfile]);

  return {
    responses,
    loading,
    saveEncryptedResponse,
    decryptResponse,
    getResponseCount,
    getLatestResponse,
    verifyResponseIntegrity,
    refetch: fetchEncryptedResponses
  };
};