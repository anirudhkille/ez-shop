import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-full border py-4 px-4 text-sm transition-colors duration-200 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export { Input };
