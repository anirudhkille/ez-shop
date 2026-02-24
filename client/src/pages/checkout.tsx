import { useState } from "react";

import { ChevronRight } from "lucide-react";

import Container from "@/layout/container";

import Address from "@/components/checkout/address";
import Delivery from "@/components/checkout/delivery";
import OrderSummary from "@/components/checkout/order-summary";
import Payment from "@/components/checkout/payment";

type Step = "shipping" | "delivery" | "payment";

const steps: { id: Step; label: string }[] = [
  { id: "shipping", label: "Shipping" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);

  const getCurrentStepIndex = () =>
    steps.findIndex((s) => s.id === currentStep);

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const goToStep = (step: Step) => {
    const targetIndex = steps.findIndex((s) => s.id === step);
    const currentIndex = getCurrentStepIndex();

    if (targetIndex < currentIndex || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  const isStepCompleted = (step: Step) => completedSteps.includes(step);
  const isStepActive = (step: Step) => currentStep === step;

  return (
    <Container className="flex flex-col gap-8 px-5 py-10 sm:px-8 md:px-10 lg:flex-row">
      <div className="flex-1">
        <h1 className="mb-8 text-2xl font-medium">Checkout</h1>

        <div className="mb-8 flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => goToStep(step.id)}
                className={`flex cursor-pointer items-center px-3 py-2 ${
                  isStepActive(step.id)
                    ? "text-primary"
                    : isStepCompleted(step.id)
                      ? "text-primary"
                      : "text-muted-foreground"
                }`}
                disabled={!isStepCompleted(step.id) && !isStepActive(step.id)}
              >
                <span className="font-medium">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight strokeWidth={1.5} className="size-4" />
              )}
            </div>
          ))}
        </div>

        <div className="border-border rounded-lg border p-6">
          {currentStep === "shipping" && (
            <Address goToNextStep={goToNextStep} />
          )}

          {currentStep === "delivery" && (
            <Delivery goToNextStep={goToNextStep} />
          )}
          {currentStep === "payment" && <Payment />}
        </div>
      </div>

      <OrderSummary />
    </Container>
  );
}
