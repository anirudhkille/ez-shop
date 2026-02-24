import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

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
    <Tag className={cn("text-xl sm:text-2xl md:text-3xl font-medium", className)}>
      {children}
    </Tag>
  );
}
