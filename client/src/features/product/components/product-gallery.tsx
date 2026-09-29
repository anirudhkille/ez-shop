import { ChevronLeft, ChevronRight } from "lucide-react";

import type { TProduct, TVariant } from "@/shared/types/product";

import { tagColors } from "../lib/constants";

interface ProductGalleryProps {
  product: TProduct;
  activeImage: string;
  activeImages: string[];
  activeVariant?: TVariant;
  selectedImageIdx: number;
  onSelectImage: (idx: number) => void;
  onStepImage: (delta: number) => void;
}

export default function ProductGallery({
  product,
  activeImage,
  activeImages,
  activeVariant,
  selectedImageIdx,
  onSelectImage,
  onStepImage,
}: ProductGalleryProps) {
  const multiple = activeImages.length > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-brand-surface-raised relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl p-12">
        <div className="bg-gradient-radial-dark absolute inset-0 opacity-60" />
        <img
          key={activeImage}
          src={activeImage}
          alt={`${product.name} – ${activeVariant?.color ?? ""}`}
          className="relative z-10 h-full w-full object-contain transition-opacity duration-300"
        />
        <span
          className={`font-body absolute top-5 left-5 z-20 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase ${tagColors[product.tag] ?? "bg-muted text-muted-foreground"}`}
        >
          {product.tag}
        </span>

        {multiple && (
          <>
            <button
              onClick={() => onStepImage(-1)}
              aria-label="Previous image"
              className="bg-background/80 hover:bg-brand-orange hover:text-primary-foreground absolute left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors duration-150"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onStepImage(1)}
              aria-label="Next image"
              className="bg-background/80 hover:bg-brand-orange hover:text-primary-foreground absolute right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors duration-150"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {multiple && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {activeImages.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => onSelectImage(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={selectedImageIdx === i}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors duration-200 ${
                selectedImageIdx === i
                  ? "border-brand-orange"
                  : "border-brand-border hover:border-brand-orange/50"
              }`}
            >
              <img
                src={img}
                alt={`View ${i + 1}`}
                className="bg-brand-surface-raised h-full w-full object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
