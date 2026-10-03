import Stripe from "stripe";
import * as orderRepository from "@/modules/order/order.repository";
import {
  claimStock,
  createPricedOrder,
  priceCart,
  priceGuestLines,
  requireGuestAddress,
  resolveSavedAddress,
  type GuestCheckoutBody,
  type Pricing,
} from "@/modules/order/order.intent";
import { env } from "@/config/env.config";
import * as invoiceService from "@/modules/invoice/invoice.service";
import { sendOrderConfirmation } from "@/modules/order/order-email";

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
    payment_intent_data: { receipt_email: email },
    customer_email: email,
    metadata,
  });

/**
 * Closes out a card sale once Stripe has accepted the session: stock comes off
 * the shelf, the session is recorded against the order, and the invoice is
 * issued. Callers that fail to open a session delete the order instead, so a
 * card that is never charged never holds stock.
 */
const settleCardOrder = async (
  order: Awaited<ReturnType<typeof orderRepository.create>>,
  lines: Parameters<typeof claimStock>[0],
  session: Stripe.Checkout.Session,
) => {
  await claimStock(lines);

  order.sessionId = session.id;
  await order.save();

  await invoiceService.issueInvoiceForOrder(order);
  await sendOrderConfirmation(order._id);
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

  await settleCardOrder(order, lines, session);

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

  await settleCardOrder(order, lines, session);

  return {
    type: "card",
    url: session.url,
  };
};
