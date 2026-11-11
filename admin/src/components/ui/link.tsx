import * as React from "react";

import NextLink, { LinkProps } from "next/link";

import { type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

const linkVariants = buttonVariants;

export interface LinkButtonProps
  extends LinkProps, VariantProps<typeof linkVariants> {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : NextLink;
    return (
      <Comp
        className={cn(linkVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
LinkButton.displayName = "LinkButton";

export { LinkButton, linkVariants };
