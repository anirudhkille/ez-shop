import type { TDeliveryMethod } from "@/features/order";

export type CheckoutStep = 1 | 2 | 3;

export type PaymentMethod = "card" | "cod";

export type DeliveryOption = {
  id: TDeliveryMethod;
  title: string;
  description: string;
  price: number;
};

export type PaymentOption = {
  id: PaymentMethod;
  title: string;
  description: string;
};

/** Normalised cart line, so the server and guest carts render identically. */
export type CheckoutCartItem = {
  _id: string;
  product: {
    _id: string;
    slug: string;
    name: string;
    image?: string;
    category?: string | { name?: string };
    price?: number;
    discountPrice?: number;
  };
  quantity: number;
  size?: string;
  priceAtPurchase?: number;
  discountPriceAtPurchase?: number;
};

/** Contact and address a guest enters, since they have no saved addresses. */
export type GuestDetails = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export const CHECKOUT_STEPS: Array<{ n: CheckoutStep; label: string }> = [
  { n: 1, label: "Contact" },
  { n: 2, label: "Shipping" },
  { n: 3, label: "Payment" },
];

export const DELIVERY_OPTIONS: DeliveryOption[] = [
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

export const PAYMENT_OPTIONS: PaymentOption[] = [
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

export const EMPTY_GUEST_DETAILS: GuestDetails = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
};

/** Every guest field marked required in the form, for step gating. */
export const isGuestContactComplete = (guest: GuestDetails): boolean =>
  Boolean(
    guest.name &&
    guest.email &&
    guest.phone &&
    guest.addressLine1 &&
    guest.city &&
    guest.state &&
    guest.zipCode &&
    guest.country
  );

/** Address fields needed before the order can be placed. */
export const isGuestAddressComplete = (guest: GuestDetails): boolean =>
  Boolean(guest.addressLine1);

export const unitPriceFor = (item: CheckoutCartItem): number =>
  item.discountPriceAtPurchase ??
  item.priceAtPurchase ??
  item.product.discountPrice ??
  item.product.price ??
  0;

export const categoryLabelFor = (item: CheckoutCartItem): string | undefined =>
  typeof item.product.category === "string"
    ? item.product.category
    : item.product.category?.name;
