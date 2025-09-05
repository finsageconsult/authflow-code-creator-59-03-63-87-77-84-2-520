import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Wallet,
  Calendar,
  ChevronRight,
  Loader2,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { EnrollmentData } from '@/hooks/useEnrollmentWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PaymentStepProps {
  enrollmentData: EnrollmentData;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  enrollmentData,
  onNext,
  onPrevious,
  onCancel,
  isLoading
}) => {
  const { course } = enrollmentData;
  const { userProfile } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price / 100);
  };

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using Google Pay, PhonePe, Paytm',
      icon: <Smartphone className="h-6 w-6" />,
      recommended: true
    },
    {
      id: 'cards',
      name: 'Credit/Debit Cards',
      description: 'Visa, Mastercard, RuPay',
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major banks supported',
      icon: <Building className="h-6 w-6" />
    },
    {
      id: 'wallet',
      name: 'Wallet',
      description: 'Paytm, Mobikwik, Amazon Pay',
      icon: <Wallet className="h-6 w-6" />
    },
    {
      id: 'emi',
      name: 'EMI Options',
      description: 'Easy monthly installments',
      icon: <Calendar className="h-6 w-6" />
    }
  ];

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!userProfile || !course) {
      toast.error('Missing user or course data');
      return;
    }

    setProcessing(true);

    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: course.price,
          serviceType: 'short-program',
          quantity: 1,
          programId: course.id,
          userType: 'INDIVIDUAL'
        }
      });

      if (error || !data.success) {
        toast.error(data?.error || 'Failed to create payment order');
        return;
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const { order } = data;

      // Configure Razorpay options with preferred method
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Finsage',
        description: `${course.title} - Course Enrollment`,
        order_id: order.razorpay_order_id,
        method: {
          [selectedPaymentMethod]: true
        },
        handler: function (response: any) {
          toast.success('Payment successful!');
          onNext(); // Proceed to next step after successful payment
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
            setProcessing(false);
            toast.info('Payment was cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        setProcessing(false);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });

      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment setup failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Course data not available</p>
        <Button onClick={onPrevious} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Payment Options</h3>
        <p className="text-muted-foreground">
          Choose your preferred payment method to complete enrollment
        </p>
      </div>

      {/* Course Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-primary">{course.title}</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(course.price)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.category}</Badge>
            <Badge variant="secondary">{course.duration}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.map((method, index) => (
            <div key={method.id}>
              <div
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted/50 ${
                  selectedPaymentMethod === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted'
                }`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedPaymentMethod === method.id ? 'bg-primary text-white' : 'bg-muted'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.name}</span>
                      {method.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {selectedPaymentMethod === method.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                </div>
              </div>
              {index < paymentMethods.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        🔒 Your payment is secured with industry-standard encryption. 
        Powered by Razorpay - trusted by millions of businesses in India.
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button onClick={onCancel} variant="outline" disabled={processing}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button onClick={onPrevious} variant="outline" disabled={processing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={!selectedPaymentMethod || processing}
            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Pay {formatPrice(course.price)}
          </Button>
        </div>
      </div>
    </div>
  );
};