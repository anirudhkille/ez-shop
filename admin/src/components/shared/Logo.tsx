import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      className={cn("object-contain w-20 h-10", className)}
    />
  );
}
