import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { useAuth } from '@/hooks/useAuth';

interface PaymentButtonProps {
  serviceType: '1on1' | 'webinar';
  amount: number;
  quantity?: number;
  disabled?: boolean;
  showCreditsWarning?: boolean;
  availableCredits?: number;
  onSuccess?: () => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  serviceType,
  amount,
  quantity = 1,
  disabled = false,
  showCreditsWarning = false,
  availableCredits = 0,
  onSuccess
}) => {
  const { userProfile } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  const getUserType = (): 'INDIVIDUAL' | 'EMPLOYEE' | 'ORGANIZATION' => {
    if (!userProfile) return 'INDIVIDUAL';
    
    switch (userProfile.role) {
      case 'EMPLOYEE':
        return 'EMPLOYEE';
      case 'HR':
      case 'ADMIN':
        return 'ORGANIZATION';
      default:
        return 'INDIVIDUAL';
    }
  };

  const userType = getUserType();
  const isEmployee = userType === 'EMPLOYEE';

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const buttonText = () => {
    if (isEmployee && !showCreditsWarning) {
      return 'Book Session';
    }
    return `Pay ${formatAmount(amount)}`;
  };

  const buttonIcon = () => {
    if (isEmployee && !showCreditsWarning) {
      return <Wallet className="h-4 w-4" />;
    }
    return <CreditCard className="h-4 w-4" />;
  };

  return (
    <>
      <div className="space-y-2">
        {showCreditsWarning && isEmployee && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-700">
              <p className="font-medium">Insufficient Credits</p>
              <p>
                You have {availableCredits} credits but need {quantity}. 
                Purchase additional credits to continue.
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={() => setShowPaymentModal(true)}
          disabled={disabled}
          className="w-full"
          size="lg"
        >
          {buttonIcon()}
          {buttonText()}
        </Button>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        serviceType={serviceType}
        amount={amount}
        quantity={quantity}
        userType={userType}
        organizationId={userProfile?.organization_id}
        onSuccess={onSuccess}
      />
    </>
  );
};