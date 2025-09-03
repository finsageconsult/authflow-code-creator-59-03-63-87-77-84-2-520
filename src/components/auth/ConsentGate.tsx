import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { useAuth } from '@/hooks/useAuth';

interface ConsentGateProps {
  children: React.ReactNode;
}

export const ConsentGate = ({ children }: ConsentGateProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, loading: authLoading } = useAuth();
  const { getConsentStatus, loading: consentLoading } = usePrivacyConsent();
  const [hasCheckedConsent, setHasCheckedConsent] = useState(false);

  useEffect(() => {
    if (authLoading || consentLoading || hasCheckedConsent) return;
    
    if (!userProfile) return;

    // Check if user has given required consents
    const hasTermsConsent = getConsentStatus('terms');
    const hasPrivacyConsent = getConsentStatus('privacy');

    if (!hasTermsConsent || !hasPrivacyConsent) {
      // User needs to give consent, redirect to consent page
      const currentPath = location.pathname + location.search;
      navigate(`/privacy-consent?required=true&redirect=${encodeURIComponent(currentPath)}`, {
        replace: true
      });
      return;
    }

    setHasCheckedConsent(true);
  }, [
    userProfile, 
    authLoading, 
    consentLoading, 
    getConsentStatus, 
    navigate, 
    location, 
    hasCheckedConsent
  ]);

  // Show loading while checking auth and consent status
  if (authLoading || consentLoading || !hasCheckedConsent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};