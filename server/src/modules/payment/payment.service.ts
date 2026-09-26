import mongoose from "mongoose";
import Stripe from "stripe";
import * as cartRepository from "@/modules/cart/cart.repository";
import * as addressRepository from "@/modules/address/address.repository";
import * as orderRepository from "@/modules/order/order.repository";
import { IOrderProduct } from "@/modules/order/order.model";
import * as productRepository from "@/modules/product/product.repository";
import { env } from "@/config/env.config";
import { AppError } from "@/utils/appError";
import * as couponService from "@/modules/coupon/coupon.service";
import * as invoiceService from "@/modules/invoice/invoice.service";
import { decrementStock, verifyStock } from "@/modules/product/product.service";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

type ProductRef = {
  _id: mongoose.Types.ObjectId;
  name: string;
  image: string;
};

interface CheckoutSessionBody {
  addressId: string;
  deliveryMethod: string;
  couponCode?: string;
}

interface GuestCheckoutBody {
  products: Array<{
    productId: string;
    variantId?: string;
    size?: string;
    quantity: number;
  }>;
  address: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  deliveryMethod: string;
  name: string;
  email: string;
  phone: string;
  couponCode?: string;
}

export const createCheckoutSession = async (
  userId: string,
  body: CheckoutSessionBody,
  userEmail: string,
) => {
  const { addressId, deliveryMethod, couponCode } = body;

  const cart = await cartRepository.findOnePopulated({ user: userId });

  if (!cart || cart.products.length === 0)
    throw new AppError("Cart is empty", 400);

  const shippingAddress = await addressRepository.findById(addressId);
  if (!shippingAddress) throw new AppError("Invalid address", 400);

  const stockError = await verifyStock(
    cart.products.map((item) => ({
      product: (item.product as unknown as ProductRef)._id.toString(),
      variantId: item.variantId ? String(item.variantId) : undefined,
      size: item.size,
      quantity: item.quantity,
    })),
  );
  if (stockError) {
    throw new AppError(stockError, 400);
  }

  const subtotal = cart.products.reduce((acc, item) => {
    const price = item.discountPriceAtPurchase ?? item.priceAtPurchase;
    return acc + price * item.quantity;
  }, 0);

  let deliveryCharge = 0;
  if (deliveryMethod === "express") deliveryCharge = 120;
  if (deliveryMethod === "same-day") deliveryCharge = 199;

  const coupon = couponCode
    ? await couponService.evaluateCoupon(couponCode, subtotal, userId)
    : null;
  const discount = coupon?.discount ?? 0;

  const total = Math.max(0, subtotal - discount) + deliveryCharge;

  const newOrder = await couponService.withCouponClaim(couponCode, () =>
    orderRepository.create({
      user: userId,
      paymentType: "card",
      paymentStatus: "pending",
      orderStatus: "processing",
      deliveryMethod,
      subtotal,
      discount,
      ...(coupon ? { coupon } : {}),
      deliveryCharge,
      totalAmount: total,

      sessionId: "",
      paymentIntentId: "",

      products: cart.products.map((item) => ({
        product: (item.product as unknown as ProductRef)._id,
        quantity: item.quantity,
        price: item.discountPriceAtPurchase ?? item.priceAtPurchase,
      })),

      address: {
        name: shippingAddress.name,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
    }),
  );

  const line_items = cart.products.map((item) => {
    const product = item.product as unknown as ProductRef;
    const price = item.discountPriceAtPurchase ?? item.priceAtPurchase;

    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: price * 100,
      },
      quantity: item.quantity,
    };
  });

  if (deliveryCharge > 0) {
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: `Delivery (${deliveryMethod})`,
          images: [],
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });
  }

  // Stripe charges the sum of line_items, so the discount has to be a
  // negative line item for the customer to actually pay less.
  if (discount > 0 && coupon) {
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: `Discount (${coupon.code})`,
          images: [],
        },
        unit_amount: -Math.round(discount * 100),
      },
      quantity: 1,
    });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/failure`,

      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["IN"],
      },

      payment_intent_data: {
        receipt_email: userEmail,
      },

      customer_email: userEmail,

      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString(),
      },
    });
  } catch (error) {
    await orderRepository.deleteById(String(newOrder._id));
    throw error;
  }

  await decrementStock(
    cart.products.map((item) => ({
      product: (item.product as unknown as ProductRef)._id.toString(),
      variantId: item.variantId ? String(item.variantId) : undefined,
      size: item.size,
      quantity: item.quantity,
    })),
  );

  newOrder.sessionId = session.id;
  await newOrder.save();

  await invoiceService.issueInvoiceForOrder(newOrder);

  return {
    type: "card",
    url: session.url,
  };
};

export const createGuestCheckoutSession = async (body: GuestCheckoutBody) => {
  const { products, address, deliveryMethod, name, email, phone, couponCode } =
    body;

  if (!products || products.length === 0)
    throw new AppError("Cart is empty", 400);

  if (!address) throw new AppError("Address is required", 400);

  const productIds = products.map((p) => p.productId);
  const dbProducts = await productRepository.findByIds(productIds);

  const productMap = new Map(dbProducts.map((p) => [String(p._id), p]));

  let subtotal = 0;
  const orderProducts: IOrderProduct[] = [];
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of products) {
    const prod = productMap.get(item.productId);
    if (!prod || !prod.publish)
      throw new AppError(
        `Product ${item.productId} not found or unavailable`,
        400,
      );

    const price = prod.discountPrice || prod.price;
    subtotal += price * item.quantity;

    orderProducts.push({
      product: item.productId,
      quantity: item.quantity,
      price,
      variantId: item.variantId,
      size: item.size,
    });

    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: prod.name,
          images: [prod.image],
        },
        unit_amount: price * 100,
      },
      quantity: item.quantity,
    });
  }

  const stockError = await verifyStock(
    products.map((p) => ({
      product: p.productId,
      variantId: p.variantId,
      size: p.size,
      quantity: p.quantity,
    })),
  );
  if (stockError) {
    throw new AppError(stockError, 400);
  }

  let deliveryCharge = 0;
  if (deliveryMethod === "express") deliveryCharge = 120;
  if (deliveryMethod === "same-day") deliveryCharge = 199;

  const coupon = couponCode
    ? await couponService.evaluateCoupon(couponCode, subtotal, null)
    : null;
  const discount = coupon?.discount ?? 0;

  const total = Math.max(0, subtotal - discount) + deliveryCharge;

  if (deliveryCharge > 0) {
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: `Delivery (${deliveryMethod})`,
          images: [],
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });
  }

  // Stripe charges the sum of line_items, so the discount has to be a
  // negative line item for the customer to actually pay less.
  if (discount > 0 && coupon) {
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: `Discount (${coupon.code})`,
          images: [],
        },
        unit_amount: -Math.round(discount * 100),
      },
      quantity: 1,
    });
  }

  const newOrder = await couponService.withCouponClaim(couponCode, () =>
    orderRepository.create({
      user: null,
      name,
      email,
      phone,
      paymentType: "card",
      paymentStatus: "pending",
      orderStatus: "processing",
      deliveryMethod,
      subtotal,
      discount,
      ...(coupon ? { coupon } : {}),
      deliveryCharge,
      totalAmount: total,
      sessionId: "",
      paymentIntentId: "",
      products: orderProducts,
      address: {
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      },
    }),
  );

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/failure`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      payment_intent_data: {
        receipt_email: email,
      },
      customer_email: email,
      metadata: {
        orderId: newOrder._id.toString(),
      },
    });
  } catch (error) {
    await orderRepository.deleteById(String(newOrder._id));
    throw error;
  }

  await decrementStock(
    products.map((p) => ({
      product: p.productId,
      variantId: p.variantId,
      size: p.size,
      quantity: p.quantity,
    })),
  );

  newOrder.sessionId = session.id;
  await newOrder.save();

  await invoiceService.issueInvoiceForOrder(newOrder);

  return {
    type: "card",
    url: session.url,
  };
};
