import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signIn, signUp, signInWithGoogle } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Key, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeData, setAccessCodeData] = useState({
    email: '',
    name: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setAccessCode(codeFromUrl);
      setActiveTab('access-code');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('An account with this email already exists. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully! Please check your email to verify your account.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          // Check if there's a pending access code for existing users
          const pendingAccessCode = sessionStorage.getItem('pendingAccessCode');
          if (pendingAccessCode) {
            try {
              const accessCodeData = JSON.parse(pendingAccessCode);
              const { data: user } = await supabase.auth.getUser();
              
              if (user.user) {
                // Use edge function to update existing user's role and organization
                const { data: consumeResponse, error: consumeError } = await supabase.functions.invoke('consume-access-code', {
                  body: {
                    userId: user.user.id,
                    code: accessCodeData.code,
                    role: accessCodeData.role,
                    organizationId: accessCodeData.organizationId
                  }
                });

                if (!consumeError && consumeResponse?.success) {
                  sessionStorage.removeItem('pendingAccessCode');
                  toast.success(`Role updated! You've joined ${accessCodeData.organizationName} as ${accessCodeData.role}`);
                }
              }
            } catch (error) {
              console.error('Error processing access code for existing user:', error);
            }
          }
          
          toast.success('Successfully signed in!');
          // Will be redirected automatically by auth hook
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

      if (!codeData?.email) {
        console.error('Verified code missing email. Cannot auto-authenticate.');
        toast.error('This access code is not linked to an email. Please use Email Login.');
        return;
      }

      // Create account with access code email
      const userEmail = codeData.email as string;
      const tempPassword = `temp_${accessCode.trim()}_${Date.now()}`;
      
      console.log('Attempting to create account for:', userEmail);

      // Try to sign up the user - if they already exist, we'll handle that
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userEmail.split('@')[0]
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered') || signUpError.message.includes('already registered')) {
          // User exists - tell them to use regular login
          console.log('User already exists, prompting for regular login');
          toast.error(`An account with ${userEmail} already exists. Please use the Email Login tab with your existing password to sign in, then contact your admin to apply the access code to your account.`);
          setActiveTab('email');
          return;
        } else {
          console.error('Sign up failed:', signUpError);
          toast.error('Failed to create user account: ' + signUpError.message);
          return;
        }
      }

      if (!signUpData.user) {
        console.error('No user data after sign up');
        toast.error('Failed to create user account');
        return;
      }

      console.log('User created successfully:', signUpData.user.id);

      // Wait for the user profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Now consume the access code to set role and organization
      const { data: consumeResponse, error: consumeError } = await supabase.functions.invoke('consume-access-code', {
        body: {
          userId: signUpData.user.id,
          code: accessCode.trim(),
          role: codeData.role,
          organizationId: codeData.organization_id
        }
      });

      if (consumeError || !consumeResponse?.success) {
        console.error('Error consuming access code:', consumeError);
        toast.error('Failed to set up account with access code');
        return;
      }

      toast.success(`Successfully logged in! Welcome to ${codeData.organization_name} as ${codeData.role}`);
      
      // The auth hook will handle the redirect automatically
      
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
              Sign in to your account or join with an access code
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="text-xs sm:text-sm">Email Login</TabsTrigger>
                <TabsTrigger value="access-code" className="text-xs sm:text-sm">Access Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="access-code" className="space-y-4">
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
                  
                  <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading || !accessCode.trim()}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Key className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Login with Access Code</span>
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-10"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required={isSignUp}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <span className="text-sm sm:text-base">{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsSignUp(!isSignUp)}
                    disabled={isLoading}
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}