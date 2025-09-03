import { ReactNode, useEffect } from 'react';
import { CheckCircle, Heart } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessMessageProps {
  title: string;
  message: string;
  icon?: ReactNode;
  showConfetti?: boolean;
  confettiIntensity?: 'gentle' | 'medium' | 'burst';
  supportiveMessage?: string;
  className?: string;
}

export const SuccessMessage = ({
  title,
  message,
  icon,
  showConfetti = true,
  confettiIntensity = 'gentle',
  supportiveMessage,
  className = ""
}: SuccessMessageProps) => {
  const { celebrateSuccess } = useConfetti();

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        celebrateSuccess(confettiIntensity);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showConfetti, confettiIntensity, celebrateSuccess]);

  return (
    <Card className={`border-green-200 bg-green-50/50 ${className}`}>
      <CardContent className="flex items-start gap-4 p-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          {icon || <CheckCircle className="w-5 h-5 text-green-600" />}
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-green-900">{title}</h3>
          <p className="text-sm text-green-700">{message}</p>
          
          {supportiveMessage && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-green-100/50 rounded-md">
              <Heart className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-800 font-medium italic">
                {supportiveMessage}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};