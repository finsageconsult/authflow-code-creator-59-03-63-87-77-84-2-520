import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Key, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeData, setAccessCodeData] = useState({
    email: '',
    name: ''
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setAccessCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleAccessCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error('Please enter an access code');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting access code login with code:', accessCode.trim());
      
      // Call edge function to verify access code
      const { data: response, error: functionError } = await supabase.functions.invoke('verify-access-code', {
        body: { code: accessCode.trim() }
      });

      console.log('Verify response:', { response, functionError });

      if (functionError) {
        console.error('Function error:', functionError);
        toast.error('Failed to verify access code. Please try again.');
        return;
      }

      if (!response || !response.success) {
        console.error('Verification failed:', response?.error);
        toast.error(response?.error || 'Invalid access code. Please check and try again.');
        return;
      }

      const codeData = response.data;
      console.log('Access code verified:', codeData);

      // Validate email and name are provided
      if (!accessCodeData.email.trim() || !accessCodeData.name.trim()) {
        toast.error('Please provide both your email and full name');
        return;
      }

      // Use the real email provided by the user
      const userEmail = accessCodeData.email.trim();
      const userName = accessCodeData.name.trim();
      const tempPassword = `temp_${accessCode.trim()}_${Date.now()}`;

      console.log('Creating account with real email:', userEmail);

      // Try to sign up with real email and provided name
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userName,
            access_code: accessCode.trim()
          }
        }
      });

      console.log('Signup result:', { signUpData, signUpError });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        toast.error(`Failed to create account: ${signUpError.message}`);
        return;
      }

      if (!signUpData.user) {
        console.error('No user created');
        toast.error('Failed to create user account');
        return;
      }

      console.log('User created successfully:', signUpData.user.id);

      // Wait for user creation and then update with access code data
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Calling consume-access-code function');

      // Use edge function to consume access code and set role
      const { data: consumeResponse, error: consumeError } = await supabase.functions.invoke('consume-access-code', {
        body: {
          userId: signUpData.user.id,
          code: accessCode.trim(),
          role: codeData.role,
          organizationId: codeData.organization_id
        }
      });

      console.log('Consume response:', { consumeResponse, consumeError });

      if (consumeError) {
        console.error('Error consuming access code:', consumeError);
        toast.error('Failed to set up account with access code.');
        return;
      }

      if (!consumeResponse?.success) {
        console.error('Consume failed:', consumeResponse?.error);
        toast.error(consumeResponse?.error || 'Failed to set up account with access code.');
        return;
      }

      toast.success(`Successfully logged in! Welcome to ${codeData.organization_name} as ${codeData.role}`);
      
      // Force immediate navigation to correct dashboard
      const correctDashboard = codeData.role === 'ADMIN' ? '/admin-dashboard' :
                              codeData.role === 'HR' ? '/hr-dashboard' :
                              codeData.role === 'EMPLOYEE' ? '/employee-dashboard' :
                              codeData.role === 'COACH' ? '/coach-dashboard' :
                              '/individual-dashboard';
      
      console.log('Redirecting to:', correctDashboard);
      setTimeout(() => {
        window.location.href = correctDashboard;
      }, 1000);
      
    } catch (error) {
      console.error('Error with access code login:', error);
      toast.error('Failed to login with access code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6">
      <div className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="absolute -top-12 sm:-top-14 left-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="w-full shadow-professional-lg border-0 sm:border">
          <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Welcome to Finsage
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground">
              Login with your access code
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleAccessCodeLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="font-mono"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter the access code sent to your email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessCodeEmail">Your Email Address</Label>
                <Input
                  id="accessCodeEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={accessCodeData.email}
                  onChange={(e) => setAccessCodeData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Provide your real email address for account creation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessCodeName">Full Name</Label>
                <Input
                  id="accessCodeName"
                  type="text"
                  placeholder="Enter your full name"
                  value={accessCodeData.name}
                  onChange={(e) => setAccessCodeData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your name will be displayed in the system
                </p>
              </div>
              
              <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading || !accessCode.trim() || !accessCodeData.email.trim() || !accessCodeData.name.trim()}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Key className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Login with Access Code</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}