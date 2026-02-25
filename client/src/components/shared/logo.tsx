import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      className={cn("h-10 w-20 object-contain", className)}
    />
  );
}
