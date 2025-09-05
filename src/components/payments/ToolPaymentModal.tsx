import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Shield, Clock, Zap } from 'lucide-react';

interface ToolPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const ToolPaymentModal: React.FC<ToolPaymentModalProps> = ({
  isOpen,
  onClose,
  tool,
  onSuccess
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = tool.price;

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to make a purchase');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      const { data, error } = await supabase.functions.invoke('create-tool-payment', {
        body: {
          toolId: tool.id,
          amount: tool.price,
          currency: 'INR'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error);
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

      // Configure Razorpay options
      const options = {
        ...data.razorpay,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-tool-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            });

            if (verifyError || !verifyData.success) {
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            toast.success('Payment successful! You now have access to the tool.');
            onSuccess();
            onClose();
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tool Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{tool.name}</h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
            <div className="text-sm text-blue-600 font-medium">Financial Tool</div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Amount:</span>
              <span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Secure payment via Razorpay</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Zap className="h-4 w-4" />
              <span>Instant access after payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Clock className="h-4 w-4" />
              <span>Lifetime access to tool</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Proceed to Pay
                </>
              )}
            </Button>
          </div>

          {/* Security Note */}
          <div className="text-xs text-muted-foreground text-center pt-2">
            <Shield className="h-3 w-3 inline mr-1" />
            Secured by Razorpay. Your payment information is encrypted and secure.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};