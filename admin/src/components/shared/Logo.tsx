import { cn } from "@/lib/utils";

/**
 * The EZ Shop brand mark, shared with the storefront (client/public/logo.svg).
 *
 * Rendered as a plain <img> rather than next/image: Next refuses to optimise SVG
 * sources unless `images.dangerouslyAllowSVG` is enabled, and a 2 KB local mark
 * gains nothing from optimisation anyway.
 *
 * The mark is a square, so size should be set on both axes — pass `size` for the
 * common case or override with `className`.
 */
export default function Logo({
  className,
  size = 32,
  alt = "EZ Shop",
}: {
  className?: string;
  size?: number;
  alt?: string;
}) {
  return (
     
    // SVG sources unless images.dangerouslyAllowSVG is enabled; a 2 KB local
    // mark gains nothing from the optimizer.
    <img
      src="/logo.svg"
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
