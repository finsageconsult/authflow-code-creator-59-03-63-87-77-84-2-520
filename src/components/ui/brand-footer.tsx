import { Heart } from 'lucide-react';

interface BrandFooterProps {
  variant?: 'default' | 'minimal' | 'full';
  className?: string;
}

export const BrandFooter = ({ variant = 'default', className = '' }: BrandFooterProps) => {
  if (variant === 'minimal') {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-xs text-muted-foreground font-medium italic flex items-center justify-center gap-1">
          <Heart className="w-3 h-3 text-primary/60" />
          Financial wellness is workplace wellness.
        </p>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <footer className={`bg-muted/30 py-8 px-4 ${className}`} role="contentinfo">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Financial Wellness is Workplace Wellness</h3>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            At Finsage, we believe that when employees feel financially secure and supported, 
            they bring their best selves to work. Our mission is to create workplace cultures 
            where financial wellness is prioritized, celebrated, and accessible to everyone.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <span>🌱 Supportive Learning</span>
            <span>🤝 Non-judgmental Guidance</span>
            <span>💚 Empathetic Approach</span>
            <span>📈 Sustainable Growth</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <div className={`text-center py-6 border-t bg-muted/20 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary/70" />
          <p className="text-sm font-medium text-primary italic">
            Financial wellness is workplace wellness.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Supporting your journey to financial confidence and peace of mind.
        </p>
      </div>
    </div>
  );
};

export default BrandFooter;