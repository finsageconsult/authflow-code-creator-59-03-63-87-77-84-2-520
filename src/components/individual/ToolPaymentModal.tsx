import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ToolPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    id: string;
    name: string;
    price: number;
    description: string;
  };
  onSuccess?: () => void;
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
      const { data, error } = await supabase.functions.invoke('create-tool-order', {
        body: {
          toolId: tool.id,
          amount: tool.price // Price is already in paisa
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
        description: `${tool.name} - Financial Tool`,
        order_id: order.razorpay_order_id,
        handler: function (response: any) {
          toast({
            title: "Payment Successful!",
            description: "You now have access to this tool.",
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
    }).format(amount / 100);
  };

  const baseAmount = tool.price;
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + gstAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Tool
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Tool:</span>
              <span className="font-medium">{tool.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {tool.description}
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

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">One-time purchase</p>
              <p>Lifetime access to this tool after purchase.</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-600" />
              <span>Secure payment via Razorpay</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-600" />
              <span>Instant access after payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-600" />
              <span>Email receipt automatically sent</span>
            </div>
          </div>

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