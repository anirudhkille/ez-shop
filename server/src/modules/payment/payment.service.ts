import Stripe from "stripe";
import * as orderRepository from "@/modules/order/order.repository";
import {
  createPricedOrder,
  priceCart,
  priceGuestLines,
  requireGuestAddress,
  resolveSavedAddress,
  type GuestCheckoutBody,
  type Pricing,
} from "@/modules/order/order.intent";
import { env } from "@/config/env.config";
import { AppError } from "@/utils/app-error";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

interface CheckoutSessionBody {
  addressId: string;
  deliveryMethod: string;
  couponCode?: string;
}

/**
 * Stripe charges the sum of the line items, so a discount has to be a negative
 * line for the customer to actually pay less. The amount is not rounded here
 * beyond the paise conversion, which keeps the Stripe total equal to the total
 * stored on the order.
 */
const buildLineItems = ({
  lines,
  deliveryMethod,
  deliveryCharge,
  discount,
  coupon,
}: Pricing): Stripe.Checkout.SessionCreateParams.LineItem[] => {
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map(
    (line) => ({
      price_data: {
        currency: "inr",
        product_data: { name: line.name, images: [line.image] },
        unit_amount: line.price * 100,
      },
      quantity: line.quantity,
    }),
  );

  if (deliveryCharge > 0) {
    items.push({
      price_data: {
        currency: "inr",
        product_data: { name: `Delivery (${deliveryMethod})`, images: [] },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });
  }

  if (discount > 0 && coupon) {
    items.push({
      price_data: {
        currency: "inr",
        product_data: { name: `Discount (${coupon.code})`, images: [] },
        unit_amount: -Math.round(discount * 100),
      },
      quantity: 1,
    });
  }

  return items;
};

const openSession = async (
  pricing: Pricing,
  email: string,
  metadata: Record<string, string>,
): Promise<Stripe.Checkout.Session> =>
  await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: buildLineItems(pricing),
    success_url: `${env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}/failure`,
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: ["IN"] },
    payment_intent_data: { receipt_email: email, metadata },
    customer_email: email,
    metadata,
  });

/**
 * Records the session against the order. Stock, invoice and email are left to
 * the webhook: a session being created is not a sale.
 */
const recordSession = async (
  order: Awaited<ReturnType<typeof orderRepository.create>>,
  session: Stripe.Checkout.Session,
) => {
  order.sessionId = session.id;
  await order.save();
};

export const createCheckoutSession = async (
  userId: string,
  body: CheckoutSessionBody,
  userEmail: string,
) => {
  const { addressId, deliveryMethod, couponCode } = body;

  const lines = await priceCart(userId);
  const address = await resolveSavedAddress(addressId);

  const { order, pricing } = await createPricedOrder({
    lines,
    buyer: { kind: "user", userId },
    address,
    deliveryMethod,
    couponCode,
    paymentType: "card",
  });

  const orderId = String(order._id);

  let session: Stripe.Checkout.Session;
  try {
    session = await openSession(pricing, userEmail, {
      orderId,
      userId: userId.toString(),
    });
  } catch (error) {
    await orderRepository.deleteById(orderId);
    throw error;
  }

  await recordSession(order, session);

  return {
    type: "card",
    url: session.url,
  };
};

export const createGuestCheckoutSession = async (body: GuestCheckoutBody) => {
  const { products, address, deliveryMethod, name, email, phone, couponCode } =
    body;

  const shippingAddress = requireGuestAddress(address);
  const lines = await priceGuestLines(products);

  const { order, pricing } = await createPricedOrder({
    lines,
    buyer: { kind: "guest", name, email, phone },
    address: shippingAddress,
    deliveryMethod,
    couponCode,
    paymentType: "card",
  });

  const orderId = String(order._id);

  let session: Stripe.Checkout.Session;
  try {
    session = await openSession(pricing, email, { orderId });
  } catch (error) {
    await orderRepository.deleteById(orderId);
    throw error;
  }

  await recordSession(order, session);

  return {
    type: "card",
    url: session.url,
  };
};

/** Opens a PaymentIntent for the native PaymentSheet. */
export const createPaymentIntent = async (
  userId: string,
  body: CheckoutSessionBody,
  userEmail: string,
) => {
  const { addressId, deliveryMethod, couponCode } = body;

  // A dismissed sheet emits no webhook, so old attempts are swept on retry.
  await orderRepository.failStalePendingCardOrders(userId);

  const lines = await priceCart(userId);
  const address = await resolveSavedAddress(addressId);

  const { order, pricing } = await createPricedOrder({
    lines,
    buyer: { kind: "user", userId },
    address,
    deliveryMethod,
    couponCode,
    paymentType: "card",
  });

  const orderId = String(order._id);

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: Math.round(pricing.total * 100),
      currency: "inr",
      automatic_payment_methods: { enabled: true },
      receipt_email: userEmail,
      metadata: { orderId, userId: userId.toString() },
    });
  } catch (error) {
    await orderRepository.deleteById(orderId);
    throw error;
  }

  order.paymentIntentId = intent.id;
  await order.save();

  return {
    type: "payment_intent",
    orderId,
    clientSecret: intent.client_secret,
    amount: pricing.total,
  };
};

/** Called when the sheet is dismissed, so the order does not stay pending. */
export const abandonPaymentIntent = async (userId: string, orderId: string) => {
  const order = await orderRepository.findById(orderId);

  if (!order || String(order.user) !== userId) {
    throw new AppError("Order not found", 404);
  }

  if (order.paymentStatus !== "pending" || !order.paymentIntentId) {
    return { abandoned: false };
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    const cancellable =
      intent.status === "canceled" ||
      intent.status === "requires_payment_method" ||
      intent.status === "requires_confirmation" ||
      intent.status === "requires_action";

    if (!cancellable) return { abandoned: false };

    if (intent.status !== "canceled") {
      await stripe.paymentIntents.cancel(order.paymentIntentId);
    }
  } catch {
    // Stripe is the source of truth; the webhook settles anything unexpected.
    return { abandoned: false };
  }

  order.paymentStatus = "failed";
  await order.save();

  return { abandoned: true };
};
