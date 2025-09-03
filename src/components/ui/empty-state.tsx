import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  supportiveMessage?: string;
  className?: string;
}

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  supportiveMessage,
  className = ""
}: EmptyStateProps) => {
  return (
    <Card className={`border-dashed border-2 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          {icon || <Heart className="w-8 h-8 text-primary/60" />}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
          
          {supportiveMessage && (
            <p className="text-xs text-primary/80 font-medium italic mt-3">
              {supportiveMessage}
            </p>
          )}
        </div>

        {action && (
          <Button 
            onClick={action.onClick}
            className="mt-4 gap-2"
            role="button"
            aria-label={`${action.label} - Take action to get started`}
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};