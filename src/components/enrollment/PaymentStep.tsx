import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Clock,
  ArrowLeft,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { EnrollmentData } from '@/hooks/useEnrollmentWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PaymentStepProps {
  enrollmentData: EnrollmentData;
  onBack: () => void;
  onComplete: () => Promise<boolean>;
  isLoading: boolean;
}

const paymentMethods = [
  {
    id: 'upi',
    name: 'UPI',
    icon: Smartphone,
    description: 'Pay using PhonePe, Google Pay, Paytm & more',
    recommended: true
  },
  {
    id: 'cards',
    name: 'Cards',
    icon: CreditCard,
    description: 'Debit & Credit Cards'
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: Building2,
    description: 'All major banks supported'
  },
  {
    id: 'wallet',
    name: 'Wallet',
    icon: Wallet,
    description: 'Paytm, Mobikwik & other wallets'
  },
  {
    id: 'emi',
    name: 'EMI',
    icon: Clock,
    description: 'Easy monthly installments'
  }
];

export const PaymentStep: React.FC<PaymentStepProps> = ({
  enrollmentData,
  onBack,
  onComplete,
  isLoading
}) => {
  const { course } = enrollmentData;
  const { userProfile } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load Razorpay script
  React.useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price / 100);
  };

  const handlePayment = async () => {
    if (!userProfile || !course) {
      toast.error('Missing user or course data');
      return;
    }

    setProcessingPayment(true);

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

      // Initialize Razorpay with selected payment method
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Finsage',
        description: `${course.title} - Course Enrollment`,
        order_id: order.razorpay_order_id,
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
        },
        method: {
          upi: selectedMethod === 'upi',
          card: selectedMethod === 'cards',
          netbanking: selectedMethod === 'netbanking',
          wallet: selectedMethod === 'wallet',
          emi: selectedMethod === 'emi'
        },
        handler: async function (response: any) {
          toast.success('Payment successful!');
          // Complete the enrollment
          const success = await onComplete();
          if (success) {
            toast.success('Enrollment completed successfully!');
          }
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          backdropclose: false,
          escape: false,
          ondismiss: function() {
            setProcessingPayment(false);
            console.log('Payment dismissed');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!course) {
    return <div>Course data not available</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
        <p className="text-muted-foreground">
          Choose your preferred payment method to enroll
        </p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {course.description}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="secondary">{course.duration}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(course.price)}
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>100% secure payment • SSL encrypted</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    className="sr-only"
                  />
                  <Icon className="h-5 w-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.name}</span>
                      {method.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={processingPayment}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handlePayment}
          disabled={processingPayment || isLoading}
          size="lg"
          className="px-8"
        >
          {processingPayment ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              Pay {formatPrice(course.price)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};