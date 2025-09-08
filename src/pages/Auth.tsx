import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signIn, signUp, signInWithGoogle } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Key, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine user type from URL path or parameters
  const getUserType = () => {
    if (location.pathname.includes('/employee') || location.pathname.includes('/employer')) {
      return 'employer';
    }
    if (location.pathname.includes('/individual')) {
      return 'individual';
    }
    return searchParams.get('type') || 'individual'; // fallback to URL param or default
  };
  
  const userType = getUserType();
  const [activeTab, setActiveTab] = useState(userType === 'employer' ? 'access-code' : 'email');
  const [accessCode, setAccessCode] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [accessCodeData, setAccessCodeData] = useState({
    email: '',
    name: ''
  });
  const [showForgotAccessCode, setShowForgotAccessCode] = useState(false);
  const [forgotAccessCodeEmail, setForgotAccessCodeEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  useEffect(() => {
    // Update activeTab when userType changes
    setActiveTab(userType === 'employer' ? 'access-code' : 'email');
    
    const codeFromUrl = searchParams.get('code') || searchParams.get('access_code');
    if (codeFromUrl) {
      setAccessCode(codeFromUrl);
      setActiveTab('access-code');
      
      // If user is already authenticated and there's an access code, process it
      const processUrlAccessCode = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // User is already logged in, just apply the access code
          try {
            const { data: response } = await supabase.functions.invoke('verify-access-code', {
              body: { code: codeFromUrl }
            });
            
            if (response?.success) {
              const codeData = response.data;
              const { data: consumeResponse } = await supabase.functions.invoke('consume-access-code', {
                body: {
                  userId: user.id,
                  code: codeFromUrl,
                  role: codeData.role,
                  organizationId: codeData.organization_id
                }
              });
              
              if (consumeResponse?.success) {
                toast.success(`Access code applied! You've joined ${codeData.organization_name} as ${codeData.role}`);
                // Redirect to appropriate dashboard
                redirectToDashboard(codeData.role);
              }
            }
          } catch (error) {
            console.error('Error processing URL access code:', error);
          }
        }
      };
      
      processUrlAccessCode();
    }
  }, [searchParams]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

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
          const msg = (error.message || '').toLowerCase();
          if (msg.includes('invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else if (msg.includes('email not confirmed')) {
            toast.error('Please verify your email address via the link we sent, then try again.');
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
          navigate('/role-redirect', { replace: true });
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

  const redirectToDashboard = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'hr':
        navigate('/hr-dashboard');
        break;
      case 'coach':
        navigate('/coach-dashboard');
        break;
      case 'employee':
        navigate('/employee-dashboard');
        break;
      case 'individual':
        navigate('/individual-dashboard');
        break;
      default:
        navigate('/dashboard');
        break;
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
      // Use admin function to authenticate with access code
      const { data: authResponse, error: authError } = await supabase.functions.invoke('auth-with-access-code', {
        body: { code: accessCode.trim() }
      });

      if (authError || !authResponse?.success) {
        toast.error(authResponse?.error || 'Invalid or expired access code');
        return;
      }

      const userData = authResponse.data;
      
      // Now sign in the user with the access code as password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: accessCode.trim()
      });

      if (signInError) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      toast.success(`Welcome to ${userData.organizationName}!`);
      redirectToDashboard(userData.role);
      
    } catch (error) {
      console.error('Access code login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) {
        if (error.message.includes('rate_limit')) {
          toast.error('Please wait before requesting another OTP. Check your email for the previous code.');
          return false;
        }
        toast.error(error.message);
        return false;
      } else {
        toast.success('OTP sent to your email! Check your inbox.');
        // Start countdown for resend
        setResendCountdown(60);
        setCanResend(false);
        return true;
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    const success = await sendOTP(otpEmail);
    if (success) {
      setShowOtpVerification(true);
      setShowForgotPassword(false);
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (!canResend || resendCountdown > 0) return;
    
    setIsLoading(true);
    await sendOTP(otpEmail);
    setIsLoading(false);
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP and sign in
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otp,
        type: 'email'
      });

      if (verifyError) {
        toast.error('Invalid OTP. Please try again.');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        toast.error('Failed to update password. Please try again.');
      } else {
        toast.success('Password updated successfully!');
        // Reset form states
        setShowOtpVerification(false);
        setShowForgotPassword(false);
        setOtpEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotAccessCodeEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('send-access-code', {
        body: { email: forgotAccessCodeEmail.trim() }
      });

      if (error || !response?.success) {
        toast.error(response?.error || 'Failed to send access code');
        return;
      }

      toast.success('Access code sent to your email!');
      setShowForgotAccessCode(false);
      setForgotAccessCodeEmail('');
      setActiveTab('access-code');
    } catch (error) {
      console.error('Send access code error:', error);
      toast.error('Failed to send access code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle different view states
  if (showForgotAccessCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-professional-lg border-0 sm:border">
            <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotAccessCode(false)}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-xl sm:text-2xl font-bold mt-8">
                Request Access Code
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter your email to receive your access code
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
              <form onSubmit={handleSendAccessCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotAccessCodeEmail">Email Address</Label>
                  <Input
                    id="forgotAccessCodeEmail"
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotAccessCodeEmail}
                    onChange={(e) => setForgotAccessCodeEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <span className="text-sm sm:text-base">Send Access Code</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showOtpVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-professional-lg border-0 sm:border">
            <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowOtpVerification(false);
                  setShowForgotPassword(true);
                }}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-xl sm:text-2xl font-bold mt-8">
                Verify OTP & Set New Password
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Check your email for the OTP code
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
              <form onSubmit={handleOtpVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                    className="font-mono text-center"
                    maxLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <span className="text-sm sm:text-base">Reset Password</span>
                </Button>
              </form>
              
              {/* Resend OTP Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    OTP sent to {otpEmail}! Check your inbox.
                  </p>
                </div>
                
                <div className="text-center">
                  {resendCountdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code? Resend in {resendCountdown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading || !canResend}
                      className="text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-professional-lg border-0 sm:border">
            <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotPassword(false)}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-xl sm:text-2xl font-bold mt-8">
                Reset Password
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter your email to receive an OTP
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpEmail">Email Address</Label>
                  <Input
                    id="otpEmail"
                    type="email"
                    placeholder="Enter your email address"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <span className="text-sm sm:text-base">Send OTP</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-professional-lg border-0 sm:border">
          <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-xl sm:text-2xl font-bold mt-8">
              Welcome to Finsage
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground">
              {userType === 'employer' 
                ? 'Sign in with your organization access code'
                : 'Sign in to your account or create a new one'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Conditionally show tabs based on user type */}
              {userType === 'individual' ? (
                <>
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="email" className="text-xs sm:text-sm">Email Login</TabsTrigger>
                  </TabsList>
                </>
              ) : (
                <>
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="access-code" className="text-xs sm:text-sm">Access Code</TabsTrigger>
                  </TabsList>
                </>
              )}
              
              {/* Conditionally show tab content based on user type */}
              {userType === 'employer' && (
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
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Enter the access code sent to your email
                        </p>
                        <button
                          type="button"
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                          onClick={() => setShowForgotAccessCode(true)}
                          disabled={isLoading}
                        >
                          Forgot Code?
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading || !accessCode.trim()}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Key className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">Sign In</span>
                    </Button>
                  </form>
                </TabsContent>
              )}
              
              {userType === 'individual' && (
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
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {!isSignUp && (
                        <div className="text-right">
                          <button
                            type="button"
                            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowForgotPassword(true)}
                            disabled={isLoading}
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}
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
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}