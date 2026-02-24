import { cn } from "@/lib/utils";
import type { ImgHTMLAttributes } from "react";

type ImageProps = {
  src: string;
  alt?: string;
  loading?: "eager" | "lazy";
  className?: string;
} & ImgHTMLAttributes<HTMLImageElement>;

export default function Image({
  src,
  alt,
  loading = "lazy",
  className,
  ...props
}: ImageProps) {
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      loading={loading}
      className={cn("w-full h-full object-cover", className)}
    />
  );
}
