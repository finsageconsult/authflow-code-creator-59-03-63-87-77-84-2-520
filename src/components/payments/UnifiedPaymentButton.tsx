import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CreditCard, Loader2, Check, Lock, CheckCircle } from 'lucide-react';

interface UnifiedPaymentButtonProps {
  itemType: 'program' | 'tool';
  itemId: string;
  title: string;
  description?: string;
  price: number; // in paisa
  isOwned?: boolean;
  onSuccess?: () => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const UnifiedPaymentButton: React.FC<UnifiedPaymentButtonProps> = ({
  itemType,
  itemId,
  title,
  description,
  price,
  isOwned = false,
  onSuccess,
  disabled = false
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
      // Create pending payment
      const { data, error } = await supabase.functions.invoke('create-unified-payment', {
        body: {
          itemType,
          itemId,
          amount: price
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        toast.error('Failed to create payment. Please try again.');
        return;
      }

      if (!data.success) {
        toast.error(data.error || 'Failed to create payment');
        return;
      }

      const { order } = data;

      // Initialize Razorpay
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Finsage',
        description: `${title} - ${itemType === 'program' ? 'Program' : 'Tool'}`,
        order_id: order.razorpay_order_id,
        handler: async function (response: any) {
          try {
            // Update payment record with transaction details
            await supabase
              .from('payments')
              .update({
                transaction_id: response.razorpay_payment_id,
                status: 'captured',
                captured_at: new Date().toISOString(),
                metadata: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }
              })
              .eq('razorpay_order_id', order.razorpay_order_id);

            // Update order status
            await supabase
              .from('orders')
              .update({ status: 'completed' })
              .eq('id', order.id);

            // Create purchase record based on item type
            if (itemType === 'program') {
              await supabase
                .from('individual_purchases')
                .insert({
                  user_id: userProfile.id,
                  program_id: itemId,
                  order_id: order.id,
                  amount_paid: price,
                  status: 'completed',
                  transaction_id: response.razorpay_payment_id,
                  access_granted_at: new Date().toISOString()
                });
            } else if (itemType === 'tool') {
              await supabase
                .from('tool_purchases')
                .insert({
                  user_id: userProfile.id,
                  tool_id: itemId,
                  order_id: order.id,
                  amount_paid: price,
                  status: 'completed',
                  transaction_id: response.razorpay_payment_id,
                  access_granted_at: new Date().toISOString()
                });
            }

            toast.success('Payment successful! You now have access.');
            onSuccess?.();
          } catch (error) {
            console.error('Post-payment processing error:', error);
            toast.error('Payment successful but access grant failed. Please contact support.');
          }
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
            // Mark payment as failed if user dismisses
            supabase
              .from('payments')
              .update({ status: 'failed' })
              .eq('razorpay_order_id', order.razorpay_order_id);
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

  const totalAmount = price; // No GST

  if (isOwned) {
    return (
      <Button variant="default" className="w-full" onClick={() => {
        // Navigate to owned content
        console.log('Accessing owned content:', title);
        // TODO: Implement content access logic
        toast.success(`Opening ${title}...`);
      }}>
        <CheckCircle className="h-4 w-4 mr-2 text-white" />
        Access Now
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setShowConfirm(true)}
        disabled={loading || disabled}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        Buy Now - {formatPrice(totalAmount)}
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
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {itemType === 'program' ? 'Program' : 'Financial Tool'}
                  </p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">{formatPrice(totalAmount)}</span>
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
                    <span>Lifetime access to {itemType}</span>
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