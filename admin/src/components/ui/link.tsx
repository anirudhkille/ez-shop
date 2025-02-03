import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { ReactNode } from "react";

interface NextLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export default function NextLink({ href, children, className }: NextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary underline-offset-4 hover:underline",
        className
      )}
    >
      {children}
    </Link>
  );
}
