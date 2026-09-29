import type { TProduct, TVariant } from "@/shared/types/product";

interface VariantPickerProps {
  product: TProduct;
  activeVariant?: TVariant;
  selectedColorIdx: number;
  selectedSize: string | null;
  sizes: { size: string; stock: number }[];
  onSelectColor: (idx: number) => void;
  onSelectSize: (size: string) => void;
}

export default function VariantPicker({
  product,
  activeVariant,
  selectedColorIdx,
  selectedSize,
  sizes,
  onSelectColor,
  onSelectSize,
}: VariantPickerProps) {
  return (
    <>
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-body text-foreground text-sm font-semibold">
            Color
          </span>
          <span className="font-body text-brand-orange text-xs font-medium">
            {activeVariant?.color}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.variants?.map((v: TVariant, i: number) => (
            <button
              key={i}
              onClick={() => onSelectColor(i)}
              aria-label={`Color ${v.color}`}
              aria-pressed={selectedColorIdx === i}
              className={`h-9 w-9 rounded-full border-2 transition-colors duration-200 ${
                selectedColorIdx === i
                  ? "border-brand-orange scale-110"
                  : "border-brand-border"
              }`}
              style={{ backgroundColor: v.colorCode }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <span className="font-body text-foreground text-sm font-semibold">
          Size (US)
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s.size}
              onClick={() => onSelectSize(s.size)}
              disabled={s.stock === 0}
              aria-pressed={selectedSize === s.size}
              className={`font-body h-10 w-12 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                selectedSize === s.size
                  ? "bg-brand-orange text-primary-foreground"
                  : "border-brand-border text-muted-foreground hover:border-brand-orange/50 hover:text-foreground border"
              }`}
            >
              {s.size}
            </button>
          ))}
        </div>
        {!selectedSize && (
          <p className="font-body text-muted-foreground mt-2 text-xs">
            Please select a size
          </p>
        )}
      </div>
    </>
  );
}
