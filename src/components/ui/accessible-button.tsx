import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const accessibleButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline focus:underline",
        // Empathetic variants for financial wellness
        supportive: "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 focus:bg-green-100 focus:ring-green-500",
        encouraging: "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 focus:bg-blue-100 focus:ring-blue-500",
        gentle: "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 focus:bg-purple-100 focus:ring-purple-500"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accessibleButtonVariants> {
  asChild?: boolean;
  supportiveMessage?: string;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, variant, size, asChild = false, supportiveMessage, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Enhanced ARIA attributes for better accessibility
    const enhancedProps = {
      ...props,
      'aria-describedby': supportiveMessage ? `${props.id}-description` : props['aria-describedby'],
      'role': props.role || 'button',
      'tabIndex': props.disabled ? -1 : (props.tabIndex || 0)
    };

    return (
      <div className="relative">
        <Comp
          className={cn(accessibleButtonVariants({ variant, size, className }))}
          ref={ref}
          {...enhancedProps}
        />
        {supportiveMessage && (
          <span
            id={`${props.id}-description`}
            className="sr-only"
            aria-live="polite"
          >
            {supportiveMessage}
          </span>
        )}
      </div>
    );
  }
);
AccessibleButton.displayName = "AccessibleButton";

export { AccessibleButton, accessibleButtonVariants };