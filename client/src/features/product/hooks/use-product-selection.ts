import { useState } from "react";

import type { TProduct } from "@/shared/types/product";

export const useProductSelection = (product: TProduct) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const activeVariant = product.variants?.[selectedColorIdx];
  const activeImages = activeVariant?.images ?? [product.image];
  const activeImage = activeImages[selectedImageIdx] ?? activeImages[0];
  const sizes = activeVariant?.sizes ?? [];

  const selectColor = (idx: number) => {
    setSelectedColorIdx(idx);
    setSelectedImageIdx(0);
  };

  const stepImage = (delta: number) =>
    setSelectedImageIdx(
      (i) => (i + delta + activeImages.length) % activeImages.length
    );

  return {
    selectedSize,
    setSelectedSize,
    selectedColorIdx,
    selectedImageIdx,
    setSelectedImageIdx,
    selectColor,
    stepImage,
    quantity,
    setQuantity,
    activeVariant,
    activeImages,
    activeImage,
    sizes,
  };
};
