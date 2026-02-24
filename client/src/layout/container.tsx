import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn(`max-w-7xl mx-auto`, className)}>{children}</div>
  );
}
