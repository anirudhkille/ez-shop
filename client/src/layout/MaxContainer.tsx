import { cn } from "@/lib/utils";

export default function MaxContainer({ children, className }) {
  return (
    <div className={cn(`max-w-[1800px] mx-auto`, className)}>{children}</div>
  );
}
