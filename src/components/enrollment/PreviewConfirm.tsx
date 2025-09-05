import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  User, 
  Clock, 
  Calendar,
  CreditCard,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { EnrollmentData } from '@/hooks/useEnrollmentWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PreviewConfirmProps {
  enrollmentData: EnrollmentData;
  userType: 'individual' | 'employee';
  onConfirm: () => Promise<boolean>;
  onPrevious: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PreviewConfirm: React.FC<PreviewConfirmProps> = ({
  enrollmentData,
  userType,
  onConfirm,
  onPrevious,
  onCancel,
  isLoading
}) => {
  const { course, coach, timeSlot } = enrollmentData;
  const { userProfile } = useAuth();

  useEffect(() => {
    // Load Razorpay script for individual users
    if (userType === 'individual' && course?.price > 0 && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        toast.error('Failed to load payment gateway. Please refresh and try again.');
      };
      document.body.appendChild(script);
    }
  }, [userType, course?.price]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price / 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01 ${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePayment = async () => {
    if (!userProfile || !course) {
      toast.error('Missing user or course data');
      return;
    }

    console.log('Course data for payment:', course);
    console.log('Course price (raw):', course.price);
    console.log('Course price formatted:', formatPrice(course.price));

    // Check if Razorpay script is loaded
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    try {
      // Create Razorpay order - amount should be in paise
      console.log('Sending to Razorpay order creation:', {
        amount: course.price,
        serviceType: 'short-program',
        quantity: 1,
        programId: course.id,
        userType: 'INDIVIDUAL'
      });

      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: course.price, // Already in paise from database
          serviceType: 'short-program',
          quantity: 1,
          programId: course.id,
          userType: 'INDIVIDUAL'
        }
      });

      if (error) {
        console.error('Order creation error:', error);
        toast.error('Failed to create order. Please try again.');
        return;
      }

      if (!data.success) {
        toast.error(data.error || 'Payment setup failed. Please try again.');
        return;
      }

      const { order } = data;
      console.log('Razorpay order response:', order);
      console.log('Opening Razorpay with order:', order);

      // Initialize Razorpay
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Finsage',
        description: `${course.title} - Course Enrollment`,
        order_id: order.razorpay_order_id,
        handler: function (response: any) {
          console.log('Payment successful:', response);
          toast.success('Payment successful!');
          // After successful payment, create the enrollment
          handleConfirm();
        },
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            // Payment was dismissed/cancelled
            console.log('Payment dismissed');
            toast.info('Payment was cancelled');
          }
        }
      };

      console.log('Razorpay options:', options);
      const razorpay = new window.Razorpay(options);
      
      // Add error handler for Razorpay
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });

      console.log('Opening Razorpay popup...');
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleConfirm = async () => {
    const success = await onConfirm();
    // Component will handle success/failure via the hook
  };

  if (!course || !coach || !timeSlot) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Incomplete enrollment data</p>
        <Button onClick={onPrevious} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const showPayment = userType === 'individual' && course.price > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review & Confirm</h3>
        <p className="text-muted-foreground">
          Please review your enrollment details before confirming
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Enrollment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Details */}
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">{course.title}</h4>
              <p className="text-sm text-muted-foreground">
                {course.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="secondary">{course.duration}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatPrice(course.price)}</div>
              {course.price === 0 && (
                <Badge variant="secondary" className="mt-1">Free</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Coach Details */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">{coach.name}</h4>
               <p className="text-sm text-muted-foreground">
                 {coach.specialties?.join(', ') || 'General Coach'}
               </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">⭐ {coach.rating}</Badge>
                <Badge variant="secondary">{coach.experience}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Time Slot Details */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">Session Schedule</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(timeSlot.date)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      {showPayment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span>Total Amount:</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(course.price)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Payment will be processed securely via Razorpay
            </p>
          </CardContent>
        </Card>
      )}

      {/* Employee Message */}
      {userType === 'employee' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                Employee Benefit - No Payment Required
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              This enrollment is covered by your organization's benefits program.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        By confirming this enrollment, you agree to our terms and conditions. 
        You will receive a confirmation email with session details and meeting link.
      </div>

      <div className="flex justify-between">
        <Button onClick={onCancel} variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button onClick={onPrevious} variant="outline" disabled={isLoading}>
            Previous
          </Button>
          <Button 
            onClick={showPayment ? handlePayment : handleConfirm} 
            disabled={isLoading}
            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {showPayment ? 'Buy Now' : 'Enroll Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};