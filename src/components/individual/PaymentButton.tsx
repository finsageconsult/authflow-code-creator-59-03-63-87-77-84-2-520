import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CreditCard, Loader2, Check } from 'lucide-react';

interface PaymentButtonProps {
  programId: string;
  title: string;
  price: number; // in paisa
  category: 'short-program' | '1-1-sessions';
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  programId,
  title,
  price,
  category,
  onSuccess
}) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  React.useEffect(() => {
    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    if (!userProfile) {
      toast.error('Please sign in to purchase');
      return;
    }

    setLoading(true);
    setShowConfirm(false);

    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: price,
          serviceType: category,
          quantity: 1,
          programId,
          userType: 'INDIVIDUAL'
        }
      });

      if (error) {
        console.error('Order creation error:', error);
        toast.error('Failed to create order. Please try again.');
        return;
      }

      if (!data.success) {
        toast.error(data.error || 'Failed to create order');
        return;
      }

      const { order } = data;

      // Initialize Razorpay
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Finsage',
        description: `${title} - ${category === 'short-program' ? 'Short Program' : '1:1 Session'}`,
        order_id: order.razorpay_order_id,
        handler: function (response: any) {
          toast.success('Payment successful!');
          onSuccess?.();
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
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInPaisa: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(priceInPaisa / 100);
  };

  return (
    <>
      <Button 
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        Buy Now - {formatPrice(price)}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category === 'short-program' ? 'Short Program' : '1:1 Session'}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(price)}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Secure payment via Razorpay</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Instant access after payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Email receipt automatically sent</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Proceed to Pay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};