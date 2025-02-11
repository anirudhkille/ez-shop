import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      alt=""
      src="/logo.png"
      width={80}
      height={40}
      className={cn("object-contain w-20 h-10", className)}
    />
  );
}
