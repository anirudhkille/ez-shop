import { AddressModal } from "@/features/account";

import { CheckoutEmpty } from "../components/checkout-empty";
import { CheckoutHero } from "../components/checkout-hero";
import { CheckoutSkeleton } from "../components/checkout-skeleton";
import { CheckoutSteps } from "../components/checkout-steps";
import { OrderSummary } from "../components/order-summary";
import { StepContact } from "../components/step-contact";
import { StepDelivery } from "../components/step-delivery";
import { StepPayment } from "../components/step-payment";
import { useCheckout } from "../hooks/use-checkout";

export default function Checkout() {
  const checkout = useCheckout();
  const isSignedIn = Boolean(checkout.token);

  if (checkout.isBusy) {
    return (
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <CheckoutHero />
          <CheckoutSkeleton />
        </div>
      </main>
    );
  }

  if (!checkout.cartItems.length) {
    return (
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <CheckoutHero />
          <CheckoutEmpty showBackToCart={isSignedIn} />
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <CheckoutHero />
        <CheckoutSteps step={checkout.step} onStepChange={checkout.setStep} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <section className="space-y-6">
            <StepContact
              isActive={checkout.step === 1}
              isSignedIn={isSignedIn}
              accountName={checkout.accountName}
              accountEmail={checkout.accountEmail}
              addresses={checkout.addresses}
              selectedAddressId={checkout.selectedAddressId}
              onSelectAddress={checkout.setSelectedAddressId}
              onOpenAddressModal={() => checkout.setIsAddressModalOpen(true)}
              guest={checkout.guest}
              onGuestChange={checkout.updateGuest}
              canContinue={checkout.canLeaveContact}
              onContinue={() => checkout.setStep(2)}
            />

            <StepDelivery
              isActive={checkout.step === 2}
              isSignedIn={isSignedIn}
              selectedDeliveryMethod={checkout.selectedDeliveryMethod}
              onSelectDeliveryMethod={checkout.setSelectedDeliveryMethod}
              selectedAddress={checkout.selectedAddress}
              guest={checkout.guest}
              canContinue={checkout.canLeaveDelivery}
              onBack={() => checkout.setStep(1)}
              onContinue={() => checkout.setStep(3)}
            />

            <StepPayment
              isActive={checkout.step === 3}
              selectedPaymentMethod={checkout.selectedPaymentMethod}
              onSelectPaymentMethod={checkout.setSelectedPaymentMethod}
              selectedDeliveryMethod={checkout.selectedDeliveryMethod}
              total={checkout.total}
              isSubmitting={checkout.isSubmitting}
              canSubmit={
                isSignedIn ? Boolean(checkout.selectedAddressId) : true
              }
              onBack={() => checkout.setStep(2)}
              onSubmit={checkout.placeOrder}
            />
          </section>

          <OrderSummary
            items={checkout.cartItems}
            subtotal={checkout.subtotal}
            discount={checkout.discount}
            couponDiscount={checkout.couponDiscount}
            couponCode={checkout.couponCode}
            deliveryCharge={checkout.deliveryCharge}
            total={checkout.total}
            isSignedIn={isSignedIn}
            selectedAddress={checkout.selectedAddress}
            guest={checkout.guest}
          />
        </div>
      </div>

      <AddressModal
        isOpen={checkout.isAddressModalOpen}
        onClose={() => checkout.setIsAddressModalOpen(false)}
        address={null}
      />
    </main>
  );
}
