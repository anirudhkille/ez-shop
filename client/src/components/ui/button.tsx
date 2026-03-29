import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-body flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wider transition-all duration-300 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-gradient-orange text-primary-foreground btn-primary-glow hover:scale-105 uppercase",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 lowercase",
        outline:
          "bg-card border border-brand-border text-foreground hover:bg-muted hover:border-brand-border/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
