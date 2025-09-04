import { Heart } from 'lucide-react';
interface BrandFooterProps {
  variant?: 'default' | 'minimal' | 'full';
  className?: string;
}
export const BrandFooter = ({
  variant = 'default',
  className = ''
}: BrandFooterProps) => {
  if (variant === 'minimal') {
    return <div className={`text-center py-4 ${className}`}>
        <p className="text-xs text-muted-foreground font-medium italic flex items-center justify-center gap-1">
          <Heart className="w-3 h-3 text-primary/60" />
          Financial wellness is workplace wellness.
        </p>
      </div>;
  }
  if (variant === 'full') {
    return;
  }
  return <div className={`text-center py-6 border-t bg-muted/20 ${className}`}>
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
    </div>;
};
export default BrandFooter;