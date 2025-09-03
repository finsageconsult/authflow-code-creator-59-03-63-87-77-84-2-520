import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
  amount: number;
  quantity: number;
  userType: 'INDIVIDUAL' | 'EMPLOYEE' | 'ORGANIZATION';
  organizationId?: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  amount,
  quantity,
  userType,
  organizationId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    // Load Razorpay script
    if (isOpen && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount,
          serviceType,
          quantity,
          userType,
          organizationId
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      const { order } = data;

      // Initialize Razorpay
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Finsage',
        description: `${serviceType === '1on1' ? '1-on-1 Coaching' : 'Webinar'} - ${quantity} session${quantity > 1 ? 's' : ''}`,
        order_id: order.razorpay_order_id,
        handler: function (response: any) {
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          });
          onSuccess?.();
          onClose();
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        theme: {
          color: '#667eea'
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const baseAmount = amount;
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + gstAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Service:</span>
              <span className="font-medium">
                {serviceType === '1on1' ? '1-on-1 Coaching' : 'Webinar'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">{formatAmount(baseAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>GST (18%):</span>
              <span>{formatAmount(gstAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatAmount(totalAmount)}</span>
            </div>
          </div>

          {userType === 'EMPLOYEE' && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Credits will be added to your account</p>
                <p>You'll receive {quantity} credits after successful payment.</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Pay ${formatAmount(totalAmount)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};