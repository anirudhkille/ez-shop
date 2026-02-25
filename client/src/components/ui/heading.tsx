import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeadingProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export default function Heading({
  as: Tag = "h2",
  children,
  className,
}: HeadingProps) {
  return (
    <Tag
      className={cn("text-xl font-medium sm:text-2xl md:text-3xl", className)}
    >
      {children}
    </Tag>
  );
}
