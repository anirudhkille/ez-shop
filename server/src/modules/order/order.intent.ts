import mongoose from "mongoose";
import * as addressRepository from "@/modules/address/address.repository";
import * as cartRepository from "@/modules/cart/cart.repository";
import * as couponService from "@/modules/coupon/coupon.service";
import * as orderRepository from "@/modules/order/order.repository";
import * as productRepository from "@/modules/product/product.repository";
import { decrementStock, verifyStock } from "@/modules/product/product.service";
import { IOrder, IOrderProduct } from "@/modules/order/order.model";
import { AppError } from "@/utils/appError";

/** A line as submitted by a guest, who has no persisted cart. */
export interface GuestLineInput {
  productId: string;
  variantId?: string;
  size?: string;
  quantity: number;
}

export interface GuestCheckoutBody {
  products: GuestLineInput[];
  address: ShippingAddress;
  deliveryMethod: string;
  name: string;
  email: string;
  phone: string;
  couponCode?: string;
}

export type Buyer =
  | { kind: "user"; userId: string }
  | { kind: "guest"; name: string; email: string; phone: string };

export type ShippingAddress = {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
};

/** A line normalised from either a stored cart or a guest payload. */
export interface PricedLine {
  product: string;
  variantId?: string;
  size?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface Pricing {
  lines: PricedLine[];
  subtotal: number;
  deliveryMethod: string;
  deliveryCharge: number;
  discount: number;
  coupon: { code: string; type: string; discount: number } | null;
  total: number;
}

type CreatedOrder = Awaited<ReturnType<typeof orderRepository.create>>;

export const deliveryChargeFor = (deliveryMethod: string): number => {
  if (deliveryMethod === "express") return 120;
  if (deliveryMethod === "same-day") return 199;
  return 0;
};

export const subtotalOf = (lines: PricedLine[]): number =>
  lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

export const totalFor = (
  subtotal: number,
  discount: number,
  deliveryCharge: number,
): number => Math.max(0, subtotal - discount) + deliveryCharge;

export const toOrderLines = (lines: PricedLine[]): IOrderProduct[] =>
  lines.map((line) => ({
    product: line.product,
    quantity: line.quantity,
    price: line.price,
    ...(line.variantId ? { variantId: line.variantId } : {}),
    ...(line.size ? { size: line.size } : {}),
  }));

const toStockItem = ({ product, variantId, size, quantity }: PricedLine) => ({
  product,
  variantId,
  size,
  quantity,
});

/**
 * Prices a signed-in buyer's cart. Cart lines carry the price captured when the
 * item was added, so a sale starting afterwards cannot change what this buyer
 * is charged.
 */
export const priceCart = async (userId: string): Promise<PricedLine[]> => {
  const cart = await cartRepository.findOnePopulated({ user: userId });

  if (!cart || cart.products.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  return cart.products.map((item) => {
    const product = item.product as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      image: string;
    };

    return {
      product: product._id.toString(),
      variantId: item.variantId ? String(item.variantId) : undefined,
      size: item.size,
      quantity: item.quantity,
      price: item.discountPriceAtPurchase ?? item.priceAtPurchase,
      name: product.name,
      image: product.image,
    };
  });
};

/**
 * Prices a guest payload against the live catalogue. Guests have no cart to
 * snapshot against, so the current price applies and unpublished products are
 * refused outright.
 */
export const priceGuestLines = async (
  items: GuestLineInput[],
): Promise<PricedLine[]> => {
  if (!items || items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const products = await productRepository.findByIds(
    items.map((item) => item.productId),
  );
  const byId = new Map(
    products.map((product) => [String(product._id), product]),
  );

  return items.map((item) => {
    const product = byId.get(item.productId);

    if (!product || !product.publish) {
      throw new AppError(
        `Product ${item.productId} not found or unavailable`,
        400,
      );
    }

    return {
      product: item.productId,
      variantId: item.variantId,
      size: item.size,
      quantity: item.quantity,
      price: product.discountPrice || product.price,
      name: product.name,
      image: product.image,
    };
  });
};

export const resolveSavedAddress = async (
  addressId: string,
): Promise<ShippingAddress> => {
  const address = await addressRepository.findById(addressId);

  if (!address) throw new AppError("Invalid address", 400);

  return {
    name: address.name,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country,
    phone: address.phone,
  };
};

export const requireGuestAddress = (
  address: ShippingAddress | undefined,
): ShippingAddress => {
  if (!address) throw new AppError("Address is required", 400);

  return address;
};

const identityOf = (buyer: Buyer): Partial<IOrder> =>
  buyer.kind === "user"
    ? { user: buyer.userId }
    : { user: null, name: buyer.name, email: buyer.email, phone: buyer.phone };

export interface CreateOrderInput {
  lines: PricedLine[];
  buyer: Buyer;
  address: ShippingAddress;
  deliveryMethod: string;
  couponCode?: string;
  paymentType: "cod" | "card";
}

/**
 * Verifies stock, prices the basket and persists the order while holding a claim
 * on the coupon, so all four checkout entry points agree on the amount charged.
 *
 * Stock is deliberately *not* decremented here. A card sale is only real once
 * Stripe has accepted it, so callers invoke `claimStock` at the point the sale
 * is secured — immediately for COD, after the session opens for card.
 */
export const createPricedOrder = async ({
  lines,
  buyer,
  address,
  deliveryMethod,
  couponCode,
  paymentType,
}: CreateOrderInput): Promise<{ order: CreatedOrder; pricing: Pricing }> => {
  const stockError = await verifyStock(lines.map(toStockItem));
  if (stockError) throw new AppError(stockError, 400);

  const subtotal = subtotalOf(lines);
  const deliveryCharge = deliveryChargeFor(deliveryMethod);

  // Guests have no user id, so per-user limits cannot apply to them.
  const coupon = couponCode
    ? await couponService.evaluateCoupon(
        couponCode,
        subtotal,
        buyer.kind === "user" ? buyer.userId : null,
      )
    : null;
  const discount = coupon?.discount ?? 0;
  const total = totalFor(subtotal, discount, deliveryCharge);

  const pricing: Pricing = {
    lines,
    subtotal,
    deliveryMethod,
    deliveryCharge,
    discount,
    coupon,
    total,
  };

  const order = await couponService.withCouponClaim(couponCode, () =>
    orderRepository.create({
      ...identityOf(buyer),
      paymentType,
      paymentStatus: "pending",
      orderStatus: "processing",
      deliveryMethod,
      subtotal,
      discount,
      ...(coupon ? { coupon } : {}),
      deliveryCharge,
      totalAmount: total,
      products: toOrderLines(lines),
      address,
    }),
  );

  return { order, pricing };
};

export const claimStock = (lines: PricedLine[]): Promise<unknown> =>
  decrementStock(lines.map(toStockItem));
