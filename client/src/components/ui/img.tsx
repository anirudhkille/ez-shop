import type { ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

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
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
