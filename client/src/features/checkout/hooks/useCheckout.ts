import { useMemo, useState } from "react";

import { useAddresss } from "@/features/account";
import { useUserStore } from "@/features/auth";
import { useCart, useCartStore } from "@/features/cart";
import type { GuestCartItem } from "@/features/cart";
import { useCouponStore } from "@/features/coupon";
import type { TDeliveryMethod } from "@/features/order";
import { usePlaceCodOrder } from "@/features/order";
import type { TAddress } from "@/shared/types/address";

import {
  type CheckoutCartItem,
  type CheckoutStep,
  DELIVERY_OPTIONS,
  EMPTY_GUEST_DETAILS,
  type GuestDetails,
  isGuestAddressComplete,
  isGuestContactComplete,
  type PaymentMethod,
} from "../types";
import { useGuestPayment, usePlaceGuestCODOrder } from "./use-guest-order";
import { usePayment } from "./usePayment";

const toCheckoutItems = (items: GuestCartItem[]): CheckoutCartItem[] =>
  items.map((item) => ({
    _id: item._id,
    product: {
      _id: item.product._id,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.image,
      category: item.product.category,
      price: item.product.price,
      discountPrice: item.product.discountPrice,
    },
    quantity: item.quantity,
    size: item.size,
    priceAtPurchase: item.priceAtPurchase,
    discountPriceAtPurchase: item.discountPriceAtPurchase,
  }));

export function useCheckout() {
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

  // A coupon applied on the cart page carries through to checkout.
  const appliedCoupon = useCouponStore((state) => state.quote);
  const guestCartItems = useCartStore((state) => state.cartItems);

  const [step, setStep] = useState<CheckoutStep>(1);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState<TDeliveryMethod>("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("card");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [guest, setGuest] = useState<GuestDetails>(EMPTY_GUEST_DETAILS);

  const updateGuest = (field: keyof GuestDetails, value: string) =>
    setGuest((prev) => ({ ...prev, [field]: value }));

  const addresses = useMemo(
    () => (addressResponse?.data ?? []) as TAddress[],
    [addressResponse]
  );

  // Guests keep their cart in local storage, so the review has to read from
  // there instead of the server cart.
  const cartItems = useMemo<CheckoutCartItem[]>(() => {
    if (token) return (cart?.products ?? []) as CheckoutCartItem[];
    return toCheckoutItems(guestCartItems);
  }, [token, cart?.products, guestCartItems]);

  // Select the preferred address once addresses load (render-time adjustment).
  const [lastAddresses, setLastAddresses] = useState(addresses);
  if (addresses !== lastAddresses) {
    setLastAddresses(addresses);
    if (!selectedAddressId) {
      const preferred =
        addresses.find((address) => address.isDefault) ?? addresses[0];
      if (preferred?._id) setSelectedAddressId(preferred._id);
    }
  }

  const selectedAddress = useMemo(
    () => addresses.find((address) => address._id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const deliveryCharge =
    DELIVERY_OPTIONS.find((option) => option.id === selectedDeliveryMethod)
      ?.price ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const discount = cart?.discountTotal ?? 0;
  // Previewed client-side only; the server recomputes from the real cart, so
  // this can never change what is charged.
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const total =
    Math.max(0, subtotal - discount - couponDiscount) + deliveryCharge;

  const isSubmitting =
    isStripePending ||
    isCodPending ||
    isGuestCodPending ||
    isGuestStripePending;
  const isBusy = cartLoading || addressLoading;

  const canLeaveContact = token
    ? Boolean(selectedAddressId)
    : isGuestContactComplete(guest);
  const canLeaveDelivery = token
    ? Boolean(selectedAddressId)
    : isGuestAddressComplete(guest);
  const hasShippingDetails = Boolean(
    selectedAddress ?? (!token && guest.addressLine1)
  );

  const placeOrder = () => {
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
          name: guest.name,
          addressLine1: guest.addressLine1,
          addressLine2: guest.addressLine2,
          city: guest.city,
          state: guest.state,
          zipCode: guest.zipCode,
          country: guest.country,
          phone: guest.phone,
        },
        deliveryMethod: selectedDeliveryMethod,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
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
      ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
    };

    if (selectedPaymentMethod === "cod") {
      placeCodOrder(payload);
      return;
    }

    startStripeCheckout(payload);
  };

  return {
    // session
    token,
    accountName: name,
    accountEmail: email,
    // cart
    cartItems,
    isBusy,
    // step
    step,
    setStep,
    // address
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    selectedAddress,
    isAddressModalOpen,
    setIsAddressModalOpen,
    // guest
    guest,
    updateGuest,
    // delivery + payment
    selectedDeliveryMethod,
    setSelectedDeliveryMethod,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    // totals
    subtotal,
    discount,
    couponDiscount,
    deliveryCharge,
    total,
    couponCode: appliedCoupon?.code,
    // submit
    isSubmitting,
    canLeaveContact,
    canLeaveDelivery,
    hasShippingDetails,
    placeOrder,
  };
}
