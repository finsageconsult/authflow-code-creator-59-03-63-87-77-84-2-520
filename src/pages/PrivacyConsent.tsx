import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConsentManager } from '@/components/privacy/ConsentManager';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const PrivacyConsent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile, loading: authLoading } = useAuth();
  const { getConsentStatus, loading: consentLoading } = usePrivacyConsent();
  const [initialCheck, setInitialCheck] = useState(false);
  
  const redirectTo = searchParams.get('redirect') || '/individual-dashboard';
  const required = searchParams.get('required') === 'true';

  useEffect(() => {
    if (!authLoading && !consentLoading && !initialCheck) {
      setInitialCheck(true);
      
      // Check if user has already given required consents
      if (!required) return;
      
      const hasTermsConsent = getConsentStatus('terms');
      const hasPrivacyConsent = getConsentStatus('privacy');
      
      if (hasTermsConsent && hasPrivacyConsent) {
        // User has already consented, redirect them
        navigate(redirectTo, { replace: true });
      }
    }
  }, [authLoading, consentLoading, required, getConsentStatus, navigate, redirectTo, initialCheck]);

  const handleConsentComplete = () => {
    navigate(redirectTo, { replace: true });
  };

  if (authLoading || consentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    navigate('/auth', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Privacy & Consent</h1>
          <p className="text-muted-foreground">
            {required 
              ? 'Please review and accept our privacy terms to continue'
              : 'Manage your privacy preferences and consent settings'
            }
          </p>
        </div>

        <ConsentManager 
          required={required} 
          onComplete={handleConsentComplete}
        />

        {required && (
          <Card className="mt-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800">Why is this required?</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-amber-700">
                To provide you with personalized financial wellness services, we need your consent 
                to process your personal data in accordance with our Privacy Policy and Terms of Service. 
                This ensures we can:
              </CardDescription>
              <ul className="mt-3 text-sm text-amber-700 space-y-1">
                <li>• Provide secure coaching and wellness services</li>
                <li>• Protect your personal and financial information</li>
                <li>• Comply with data protection regulations</li>
                <li>• Enable secure communication with coaches</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};