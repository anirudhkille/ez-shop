import { cn } from "../../utils/cn";

export default function Logo({ className }) {
  return (
    <img
      src="/logo.png"
      className={cn("object-contain w-20 h-10", className)}
    />
  );
}
