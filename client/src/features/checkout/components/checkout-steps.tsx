import { CHECKOUT_STEPS, type CheckoutStep } from "../types";

type Props = {
  step: CheckoutStep;
  onStepChange: (step: CheckoutStep) => void;
};

export function CheckoutSteps({ step, onStepChange }: Props) {
  return (
    <div className="mb-10 flex items-center gap-2">
      {CHECKOUT_STEPS.map((entry, index) => (
        <div key={entry.n} className="flex items-center gap-2">
          <button
            type="button"
            disabled={step <= entry.n}
            onClick={() => onStepChange(entry.n)}
            className="flex cursor-pointer items-center gap-2 disabled:cursor-default"
          >
            <span
              className={`font-body flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                step >= entry.n
                  ? "bg-brand-orange text-primary-foreground"
                  : "border-brand-border text-muted-foreground border"
              }`}
            >
              {entry.n}
            </span>
            <span
              className={`font-body hidden text-sm sm:block ${
                step >= entry.n ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {entry.label}
            </span>
          </button>
          {index < CHECKOUT_STEPS.length - 1 && (
            <div
              className={`h-px w-8 ${
                step > entry.n ? "bg-brand-orange" : "bg-brand-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
