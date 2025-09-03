import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { Shield, Lock, Mail, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConsentManagerProps {
  required?: boolean;
  onComplete?: () => void;
}

export const ConsentManager = ({ required = false, onComplete }: ConsentManagerProps) => {
  const { recordConsent, getConsentStatus, loading } = usePrivacyConsent();
  const { toast } = useToast();
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    marketing: false,
    analytics: false
  });

  useEffect(() => {
    if (!loading) {
      setConsents({
        terms: getConsentStatus('terms'),
        privacy: getConsentStatus('privacy'),
        marketing: getConsentStatus('marketing'),
        analytics: getConsentStatus('analytics')
      });
    }
  }, [loading, getConsentStatus]);

  const handleConsentChange = async (
    type: keyof typeof consents,
    checked: boolean
  ) => {
    const { error } = await recordConsent(type, checked);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update consent preferences",
        variant: "destructive",
      });
      return;
    }

    setConsents(prev => ({ ...prev, [type]: checked }));
    
    toast({
      title: "Consent Updated",
      description: `${type} consent has been ${checked ? 'granted' : 'withdrawn'}`,
    });
  };

  const handleSaveAll = async () => {
    const promises = Object.entries(consents).map(([type, value]) =>
      recordConsent(type as keyof typeof consents, value)
    );

    const results = await Promise.all(promises);
    const hasErrors = results.some(r => r.error);

    if (hasErrors) {
      toast({
        title: "Error",
        description: "Some consent preferences could not be saved",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Consent Preferences Saved",
      description: "Your privacy preferences have been updated",
    });

    onComplete?.();
  };

  const isRequiredValid = !required || (consents.terms && consents.privacy);

  const consentItems = [
    {
      key: 'terms' as const,
      title: 'Terms of Service',
      description: 'I agree to the Terms of Service and understand my rights and obligations',
      icon: Shield,
      required: true,
      color: 'text-red-600'
    },
    {
      key: 'privacy' as const,
      title: 'Privacy Policy',
      description: 'I consent to the collection and processing of my personal data as outlined in the Privacy Policy',
      icon: Lock,
      required: true,
      color: 'text-red-600'
    },
    {
      key: 'marketing' as const,
      title: 'Marketing Communications',
      description: 'I consent to receive marketing emails and promotional content (optional)',
      icon: Mail,
      required: false,
      color: 'text-blue-600'
    },
    {
      key: 'analytics' as const,
      title: 'Analytics & Performance',
      description: 'I consent to anonymous usage analytics to help improve the service (optional)',
      icon: BarChart3,
      required: false,
      color: 'text-green-600'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Consent Management
        </CardTitle>
        <CardDescription>
          Manage your privacy preferences and data consent settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {consentItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-start space-x-3 p-4 border rounded-lg">
              <Icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={consents[item.key]}
                    onCheckedChange={(checked) => 
                      handleConsentChange(item.key, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={item.key} 
                    className="font-medium cursor-pointer"
                  >
                    {item.title}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}

        {required && (
          <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium">
              Required Consents
            </p>
            <p className="text-sm text-muted-foreground">
              Terms of Service and Privacy Policy consent are required to use this service.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button 
            onClick={handleSaveAll}
            disabled={!isRequiredValid}
            className="min-w-[120px]"
          >
            Save Preferences
          </Button>
        </div>

        {required && !isRequiredValid && (
          <p className="text-sm text-red-600 text-center">
            Please accept the required consents to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
};