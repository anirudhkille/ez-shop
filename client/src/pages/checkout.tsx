import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";

import type { TAddress } from "@/types/address";
import type { TDeliveryMethod } from "@/types/order";

import { formatPrice } from "@/lib/formatPrice";

import { useCartStore } from "@/store/cartStore";
import useUserStore from "@/store/userStore";

import { useAddresss } from "@/hooks/useAddress";
import { useCart } from "@/hooks/useCart";
import {
  useGuestPayment,
  usePlaceCodOrder,
  usePlaceGuestCODOrder,
} from "@/hooks/useOrder";
import { usePayment } from "@/hooks/usePayment";

import AddressModal from "@/features/account/address-modal";

type CheckoutStep = 1 | 2 | 3;
type PaymentMethod = "card" | "cod";

type CartProduct = {
  _id: string;
  product: {
    _id: string;
    slug: string;
    name: string;
    image?: string;
    category?: string | { name?: string };
  };
  quantity: number;
  size?: string;
  priceAtPurchase?: number;
  discountPriceAtPurchase?: number;
};

const deliveryOptions: Array<{
  id: TDeliveryMethod;
  title: string;
  description: string;
  price: number;
}> = [
  {
    id: "standard",
    title: "Standard Delivery",
    description: "Delivery in 3 to 5 business days",
    price: 0,
  },
  {
    id: "express",
    title: "Express Delivery",
    description: "Delivery in 1 to 2 business days",
    price: 120,
  },
  {
    id: "same-day",
    title: "Same Day Delivery",
    description: "Priority delivery for select cities",
    price: 199,
  },
];

const paymentOptions: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
}> = [
  {
    id: "card",
    title: "Pay with Stripe",
    description: "Secure card checkout powered by Stripe",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when your order arrives",
  },
];

export default function Checkout() {
  const { token, name, email } = useUserStore();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addressResponse, isLoading: addressLoading } = useAddresss();
  const { mutate: startStripeCheckout, isPending: isStripePending } =
    usePayment();
  const { mutate: placeCodOrder, isPending: isCodPending } = usePlaceCodOrder();
  const { mutate: placeGuestCOD, isPending: isGuestCodPending } =
    usePlaceGuestCODOrder();
  const { mutate: startGuestStripe, isPending: isGuestStripePending } =
    useGuestPayment();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState<TDeliveryMethod>("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("card");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddressLine1, setGuestAddressLine1] = useState("");
  const [guestAddressLine2, setGuestAddressLine2] = useState("");
  const [guestCity, setGuestCity] = useState("");
  const [guestState, setGuestState] = useState("");
  const [guestZip, setGuestZip] = useState("");
  const [guestCountry, setGuestCountry] = useState("India");

  const cartProducts = (cart?.products ?? []) as CartProduct[];
  const addresses = (addressResponse?.data ?? []) as TAddress[];
  const guestCartItems = useCartStore((s) => s.cartItems);

  useEffect(() => {
    if (!addresses.length) return;

    const preferredAddress =
      addresses.find((address) => address.isDefault) ?? addresses[0];

    if (preferredAddress?._id && !selectedAddressId) {
      setSelectedAddressId(preferredAddress._id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address._id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const deliveryCharge =
    deliveryOptions.find((option) => option.id === selectedDeliveryMethod)
      ?.price ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const discount = cart?.discountTotal ?? 0;
  const total = subtotal - discount + deliveryCharge;
  const isSubmitting =
    isStripePending ||
    isCodPending ||
    isGuestCodPending ||
    isGuestStripePending;
  const isBusy = cartLoading || addressLoading;

  const handlePlaceOrder = () => {
    if (isSubmitting) return;

    if (!token) {
      const guestPayload = {
        products: guestCartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          size: item.size,
          variantId: item.variantId,
        })),
        address: {
          name: guestName,
          addressLine1: guestAddressLine1,
          addressLine2: guestAddressLine2,
          city: guestCity,
          state: guestState,
          zipCode: guestZip,
          country: guestCountry,
          phone: guestPhone,
        },
        deliveryMethod: selectedDeliveryMethod,
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
      };

      if (selectedPaymentMethod === "cod") {
        placeGuestCOD(guestPayload);
        return;
      }

      startGuestStripe(guestPayload);
      return;
    }

    if (!selectedAddressId) return;

    const payload = {
      addressId: selectedAddressId,
      deliveryMethod: selectedDeliveryMethod,
    };

    if (selectedPaymentMethod === "cod") {
      placeCodOrder(payload);
      return;
    }

    startStripeCheckout(payload);
  };

  const hero = (
    <div className="mb-10">
      <span className="font-body text-brand-orange text-xs font-semibold tracking-[0.32em] uppercase">
        Secure Checkout
      </span>
      <h1 className="font-display text-foreground mt-2 text-5xl font-black uppercase lg:text-6xl">
        Complete Your <span className="text-gradient-orange">Order</span>
      </h1>
      <p className="font-body text-muted-foreground mt-3 max-w-2xl text-sm leading-6 sm:text-base">
        Review your delivery details, choose a payment option, and finish your
        order in one clean flow.
      </p>
    </div>
  );

  if (!token && !guestCartItems.length) {
    return (
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          {hero}
          <div className="bg-card border-brand-border rounded-4xl border p-8 text-center lg:p-14">
            <div className="bg-brand-orange/10 mx-auto flex h-18 w-18 items-center justify-center rounded-full">
              <ShoppingCart className="text-brand-orange h-9 w-9" />
            </div>
            <h2 className="font-display text-foreground mt-6 text-3xl font-black uppercase">
              Your cart is empty
            </h2>
            <p className="font-body text-muted-foreground mx-auto mt-3 max-w-lg text-sm leading-6">
              Add products to your cart first, then come back to checkout.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
              >
                Browse Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isBusy) {
    return (
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {hero}
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-card border-brand-border h-40 animate-pulse rounded-[1.75rem] border"
                />
              ))}
            </div>
            <div className="bg-card border-brand-border h-104 animate-pulse rounded-[1.75rem] border" />
          </div>
        </div>
      </main>
    );
  }

  if (!cartProducts.length) {
    return (
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          {hero}
          <div className="bg-card border-brand-border rounded-4xl border p-8 text-center lg:p-14">
            <div className="bg-brand-orange/10 mx-auto flex h-18 w-18 items-center justify-center rounded-full">
              <PackageCheck className="text-brand-orange h-9 w-9" />
            </div>
            <h2 className="font-display text-foreground mt-6 text-3xl font-black uppercase">
              Your cart is empty
            </h2>
            <p className="font-body text-muted-foreground mx-auto mt-3 max-w-lg text-sm leading-6">
              Add a few products to your cart before starting checkout.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
              >
                Explore Products <ArrowRight size={16} />
              </Link>
              <Link
                to="/cart"
                className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-full border px-7 py-4 text-sm tracking-wider uppercase transition-all"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {hero}

        <div className="mb-10 flex items-center gap-2">
          {[
            { n: 1, label: "Contact" },
            { n: 2, label: "Shipping" },
            { n: 3, label: "Payment" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`flex cursor-pointer items-center gap-2`}
                onClick={() => step > s.n && setStep(s.n as 1 | 2 | 3)}
              >
                <div
                  className={`font-body flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${step >= s.n ? "bg-brand-orange text-primary-foreground" : "border-brand-border text-muted-foreground border"}`}
                >
                  {s.n}
                </div>
                <span
                  className={`font-body hidden text-sm sm:block ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`h-px w-8 ${step > s.n ? "bg-brand-orange" : "bg-brand-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <section className="space-y-6">
            <div
              className={`bg-card border-brand-border rounded-[1.75rem] border p-6 transition-opacity lg:p-8 ${
                step !== 1 ? "hidden" : ""
              }`}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
                    Step 1
                  </p>
                  <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
                    {token ? "Delivery Address" : "Contact & Address"}
                  </h2>
                </div>
                {token && (
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="border-brand-border text-muted-foreground hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase transition-all"
                  >
                    <Plus size={14} />
                    Add Address
                  </button>
                )}
              </div>

              {token ? (
                <>
                  <div className="border-brand-border bg-brand-surface-raised/40 mb-6 rounded-2xl border border-dashed p-4">
                    <p className="font-body text-foreground text-sm font-semibold">
                      Signed in as {name || "EZ Shop customer"}
                    </p>
                    <p className="font-body text-muted-foreground mt-1 text-sm">
                      {email || "Email unavailable"}
                    </p>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="border-brand-border bg-brand-surface-raised/30 rounded-2xl border border-dashed p-8 text-center">
                      <MapPin className="text-brand-orange mx-auto h-9 w-9" />
                      <h3 className="font-display text-foreground mt-4 text-2xl font-black uppercase">
                        Add an address to continue
                      </h3>
                      <p className="font-body text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
                        Checkout needs a delivery address before we can
                        calculate shipping and payment options.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
                      >
                        <Plus size={14} />
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => {
                        const isSelected = address._id === selectedAddressId;

                        return (
                          <label
                            key={address._id}
                            className={`block cursor-pointer rounded-3xl border p-5 transition-all ${
                              isSelected
                                ? "border-brand-orange bg-brand-orange/8 shadow-[0_18px_50px_-35px_rgba(255,122,24,0.8)]"
                                : "border-brand-border hover:border-brand-orange/35 hover:bg-brand-surface-raised/40"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="radio"
                                name="address"
                                checked={isSelected}
                                onChange={() =>
                                  setSelectedAddressId(address._id ?? "")
                                }
                                className="accent-brand-orange mt-1 h-4 w-4"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-body text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                                    {address.label}
                                  </p>
                                  {address.isDefault && (
                                    <span className="bg-brand-orange text-primary-foreground rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="font-body text-foreground mt-3 text-base font-semibold">
                                  {address.name}
                                </p>
                                <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
                                  {address.addressLine1}
                                  {address.addressLine2
                                    ? `, ${address.addressLine2}`
                                    : ""}
                                  <br />
                                  {address.city}, {address.state}{" "}
                                  {address.zipCode}
                                  <br />
                                  {address.country}
                                </p>
                                <p className="font-body text-muted-foreground mt-2 text-sm">
                                  {address.phone}
                                </p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                      />
                      <input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border py-3 pr-4 pl-9 text-sm transition-colors focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                      />
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border py-3 pr-4 pl-9 text-sm transition-colors focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                      />
                      <input
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border py-3 pr-4 pl-9 text-sm transition-colors focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-brand-border pt-4">
                    <p className="font-body text-muted-foreground mb-4 text-xs font-semibold tracking-[0.18em] uppercase">
                      Delivery Address
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={guestAddressLine1}
                          onChange={(e) => setGuestAddressLine1(e.target.value)}
                          placeholder="123 Main Street"
                          className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                          Address Line 2
                        </label>
                        <input
                          value={guestAddressLine2}
                          onChange={(e) => setGuestAddressLine2(e.target.value)}
                          placeholder="Apartment, suite, etc."
                          className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={guestCity}
                            onChange={(e) => setGuestCity(e.target.value)}
                            placeholder="Mumbai"
                            className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={guestState}
                            onChange={(e) => setGuestState(e.target.value)}
                            placeholder="Maharashtra"
                            className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                            ZIP Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={guestZip}
                            onChange={(e) => setGuestZip(e.target.value)}
                            placeholder="400001"
                            className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-body text-foreground mb-1.5 block text-xs font-semibold tracking-[0.18em] uppercase">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={guestCountry}
                            onChange={(e) => setGuestCountry(e.target.value)}
                            placeholder="India"
                            className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/cart"
                  className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm tracking-wider uppercase transition-all"
                >
                  <ArrowLeft size={16} />
                  Back to Cart
                </Link>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={
                    token
                      ? !selectedAddressId
                      : !guestName ||
                        !guestEmail ||
                        !guestPhone ||
                        !guestAddressLine1 ||
                        !guestCity ||
                        !guestState ||
                        !guestZip ||
                        !guestCountry
                  }
                  className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to Delivery
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div
              className={`bg-card border-brand-border rounded-[1.75rem] border p-6 transition-opacity lg:p-8 ${
                step !== 2 ? "hidden" : ""
              }`}
            >
              <div className="mb-6">
                <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
                  Step 2
                </p>
                <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
                  Delivery Method
                </h2>
              </div>

              <div className="space-y-4">
                {deliveryOptions.map((option) => {
                  const isSelected = option.id === selectedDeliveryMethod;

                  return (
                    <label
                      key={option.id}
                      className={`block cursor-pointer rounded-3xl border p-5 transition-all ${
                        isSelected
                          ? "border-brand-orange bg-brand-orange/8"
                          : "border-brand-border hover:border-brand-orange/35 hover:bg-brand-surface-raised/40"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={isSelected}
                          onChange={() => setSelectedDeliveryMethod(option.id)}
                          className="accent-brand-orange mt-1 h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-body text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                                {option.title}
                              </p>
                              <p className="font-body text-muted-foreground mt-2 text-sm">
                                {option.description}
                              </p>
                            </div>
                            <span className="font-display text-brand-orange text-2xl font-black">
                              {option.price === 0
                                ? "Free"
                                : formatPrice(option.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {(selectedAddress || (!token && guestAddressLine1)) && (
                <div className="bg-brand-surface-raised/40 border-brand-border mt-6 rounded-2xl border p-4">
                  <p className="font-body text-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                    Delivering to
                  </p>
                  {token && selectedAddress ? (
                    <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
                      {selectedAddress.name}, {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2
                        ? `, ${selectedAddress.addressLine2}`
                        : ""}
                      , {selectedAddress.city}, {selectedAddress.state}{" "}
                      {selectedAddress.zipCode}
                    </p>
                  ) : (
                    <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
                      {guestName}, {guestAddressLine1}
                      {guestAddressLine2 ? `, ${guestAddressLine2}` : ""},{" "}
                      {guestCity}, {guestState} {guestZip}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm tracking-wider uppercase transition-all"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={token ? !selectedAddressId : !guestAddressLine1}
                  className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to Payment
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div
              className={`bg-card border-brand-border rounded-[1.75rem] border p-6 transition-opacity lg:p-8 ${
                step !== 3 ? "hidden" : ""
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
                    Step 3
                  </p>
                  <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
                    Payment Method
                  </h2>
                </div>
                <div className="text-muted-foreground border-brand-border inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs tracking-[0.18em] uppercase">
                  <Lock size={14} />
                  Encrypted
                </div>
              </div>

              <div className="space-y-4">
                {paymentOptions.map((option) => {
                  const isSelected = option.id === selectedPaymentMethod;

                  return (
                    <label
                      key={option.id}
                      className={`block cursor-pointer rounded-3xl border p-5 transition-all ${
                        isSelected
                          ? "border-brand-orange bg-brand-orange/8"
                          : "border-brand-border hover:border-brand-orange/35 hover:bg-brand-surface-raised/40"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={isSelected}
                          onChange={() => setSelectedPaymentMethod(option.id)}
                          className="accent-brand-orange mt-1 h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {option.id === "card" ? (
                              <CreditCard className="text-brand-orange h-5 w-5" />
                            ) : (
                              <Truck className="text-brand-orange h-5 w-5" />
                            )}
                            <p className="font-body text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                              {option.title}
                            </p>
                          </div>
                          <p className="font-body text-muted-foreground mt-2 text-sm">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="bg-brand-surface-raised/40 border-brand-border mt-6 rounded-2xl border p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-orange mt-0.5 h-5 w-5" />
                  <div>
                    <p className="font-body text-foreground text-sm font-semibold">
                      {selectedPaymentMethod === "card"
                        ? "You�ll be redirected to Stripe to complete payment."
                        : "Your order will be confirmed now and paid at delivery."}
                    </p>
                    <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
                      Delivery method:{" "}
                      {
                        deliveryOptions.find(
                          (option) => option.id === selectedDeliveryMethod
                        )?.title
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm tracking-wider uppercase transition-all"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={
                    token ? !selectedAddressId || isSubmitting : isSubmitting
                  }
                  className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock size={16} />
                  {isSubmitting
                    ? "Processing..."
                    : `${selectedPaymentMethod === "card" ? "Pay" : "Place Order"} ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          </section>

          <aside>
            <div className="bg-card border-brand-border sticky top-24 rounded-[1.75rem] border p-6 lg:p-8">
              <div className="mb-6">
                <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
                  Order Review
                </p>
                <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
                  Summary
                </h2>
              </div>

              <div className="space-y-4">
                {cartProducts.map((item) => {
                  const category =
                    typeof item.product.category === "string"
                      ? item.product.category
                      : item.product.category?.name;
                  const unitPrice =
                    item.discountPriceAtPurchase ?? item.priceAtPurchase ?? 0;

                  return (
                    <div
                      key={item._id}
                      className="border-brand-border flex gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <Link
                        to={`/${item.product.slug}/${item.product._id}`}
                        className="bg-brand-surface-raised flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-2"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        {category && (
                          <p className="font-body text-muted-foreground text-[10px] tracking-[0.24em] uppercase">
                            {category}
                          </p>
                        )}
                        <p className="font-body text-foreground mt-1 text-sm font-semibold">
                          {item.product.name}
                        </p>
                        <p className="font-body text-muted-foreground mt-2 text-xs">
                          Qty {item.quantity}
                          {item.size ? ` � Size ${item.size}` : ""}
                        </p>
                      </div>
                      <div className="font-display text-brand-orange text-lg font-black">
                        {formatPrice(unitPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-brand-border mt-6 space-y-3 border-t pt-5">
                <div className="font-body flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="font-body flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-500">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div className="font-body flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">
                    {deliveryCharge === 0
                      ? "Free"
                      : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="border-brand-border flex items-center justify-between border-t pt-4">
                  <span className="font-display text-foreground text-lg font-black uppercase">
                    Total
                  </span>
                  <span className="font-display text-brand-orange text-3xl font-black">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {(selectedAddress || (!token && guestAddressLine1)) && (
                <div className="bg-brand-surface-raised/40 border-brand-border mt-6 rounded-2xl border p-4">
                  <p className="font-body text-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                    Shipping To
                  </p>
                  {token && selectedAddress ? (
                    <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
                      {selectedAddress.name}
                      <br />
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2
                        ? `, ${selectedAddress.addressLine2}`
                        : ""}
                      <br />
                      {selectedAddress.city}, {selectedAddress.state}{" "}
                      {selectedAddress.zipCode}
                    </p>
                  ) : (
                    <p className="font-body text-muted-foreground mt-2 text-sm leading-6">
                      {guestName}
                      <br />
                      {guestAddressLine1}
                      {guestAddressLine2 ? `, ${guestAddressLine2}` : ""}
                      <br />
                      {guestCity}, {guestState} {guestZip}
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={null}
      />
    </main>
  );
}
