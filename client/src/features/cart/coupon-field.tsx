import { useState } from "react";

import { Tag, TicketPercent } from "lucide-react";

import { formatPrice } from "@/lib/formatPrice";

import { useCouponStore } from "@/store/couponStore";

import { useApplyCoupon } from "@/hooks/useCoupon";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CouponFieldProps {
  subtotal: number;
  className?: string;
}

/**
 * Applies a real coupon code. Validation and the discount both come from the
 * server, so an invalid or ineligible code shows an error instead of a
 * fabricated discount.
 */
export default function CouponField({ subtotal, className }: CouponFieldProps) {
  const [code, setCode] = useState("");
  const { quote, setQuote, clear } = useCouponStore();
  const { mutate, isPending } = useApplyCoupon();

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    mutate(
      { code: trimmed, subtotal },
      {
        onSuccess: (result) => {
          setQuote(result, subtotal);
          setCode("");
        },
      }
    );
  };

  const handleRemove = () => {
    clear();
    setCode("");
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          {quote ? (
            <TicketPercent
              size={14}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
          ) : (
            <Tag
              size={14}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
          )}
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleApply();
              }
            }}
            placeholder={quote ? `${quote.code} applied` : "Promo code"}
            disabled={isPending || !!quote}
            autoComplete="off"
            className="rounded-xl py-2.5 pr-4 pl-9 text-sm"
          />
        </div>
        {quote ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            className="rounded-xl px-4 py-2.5 text-sm"
          >
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleApply}
            disabled={isPending || !code.trim()}
            className="rounded-xl px-4 py-2.5 text-sm"
          >
            {isPending ? "Applying…" : "Apply"}
          </Button>
        )}
      </div>
      {quote ? (
        <p className="font-body mt-2 text-xs font-medium text-green-400">
          {quote.type === "percentage"
            ? `${quote.value}% off applied — you saved ${formatPrice(quote.discount)}`
            : `Applied — you saved ${formatPrice(quote.discount)}`}
        </p>
      ) : null}
    </div>
  );
}
