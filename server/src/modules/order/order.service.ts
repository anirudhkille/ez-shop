import * as cartRepository from "@/modules/cart/cart.repository";
import * as addressRepository from "@/modules/address/address.repository";
import * as productRepository from "@/modules/product/product.repository";
import mongoose from "mongoose";
import { env } from "@/config/env.config";
import { decrementStock, verifyStock } from "@/modules/product/product.service";
import * as orderRepository from "@/modules/order/order.repository";
import { IOrder, IOrderProduct } from "@/modules/order/order.model";
import { AppError } from "@/utils/appError";
import * as couponService from "@/modules/coupon/coupon.service";
import * as invoiceService from "@/modules/invoice/invoice.service";

type ProductRef = {
  _id: mongoose.Types.ObjectId;
};

interface CODRequestBody {
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

export const placeCODOrder = async (userId: string, body: CODRequestBody) => {
  const { addressId, deliveryMethod, couponCode } = body;

  const cart = await cartRepository.findOnePopulated({ user: userId });
  if (!cart || cart.products.length === 0)
    throw new AppError("Cart is empty", 400);

  const address = await addressRepository.findById(addressId);
  if (!address) throw new AppError("Invalid address", 400);

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

  const subtotal = cart.products.reduce((sum, item) => {
    const price = item.discountPriceAtPurchase ?? item.priceAtPurchase;
    return sum + price * item.quantity;
  }, 0);

  let deliveryCharge = 0;
  if (deliveryMethod === "express") deliveryCharge = 120;
  if (deliveryMethod === "same-day") deliveryCharge = 199;

  const coupon = couponCode
    ? await couponService.evaluateCoupon(couponCode, subtotal, userId)
    : null;
  const discount = coupon?.discount ?? 0;

  const totalAmount = Math.max(0, subtotal - discount) + deliveryCharge;

  const newOrder = await couponService.withCouponClaim(couponCode, () =>
    orderRepository.create({
      user: userId,
      paymentType: "cod",
      paymentStatus: "pending",
      orderStatus: "processing",
      deliveryMethod,
      subtotal,
      discount,
      ...(coupon ? { coupon } : {}),
      deliveryCharge,
      totalAmount,

      products: cart.products.map((item) => ({
        product: (item.product as unknown as ProductRef)._id,
        quantity: item.quantity,
        price: item.discountPriceAtPurchase ?? item.priceAtPurchase,
      })),

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

  await decrementStock(
    cart.products.map((item) => ({
      product: (item.product as unknown as ProductRef)._id.toString(),
      variantId: item.variantId ? String(item.variantId) : undefined,
      size: item.size,
      quantity: item.quantity,
    })),
  );

  await cartRepository.clearProducts(userId);

  await invoiceService.issueInvoiceForOrder(newOrder);

  return {
    orderId: newOrder._id,
    redirectUrl: `${env.CLIENT_URL}/success?orderId=${newOrder._id}`,
  };
};

export const getOrders = async (limit: number, page: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    orderRepository.find(skip, limit),
    orderRepository.countDocuments(),
  ]);

  return {
    items: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyOrder = async (
  userId: string,
  limit: number,
  page: number,
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    orderRepository.findByUser(userId, skip, limit),
    orderRepository.countByUser(userId),
  ]);

  return {
    items: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const isOrderAccessible = (
  order: { user?: mongoose.Types.ObjectId | string | null },
  user?: Express.User,
): boolean => {
  if (!user) return true;
  if (user.role === "Admin") return true;
  if (!order.user) return false;
  return (
    String((order.user as unknown as { _id?: unknown })._id ?? order.user) ===
    String(user._id)
  );
};

export const getOrderById = async (id: string, user?: Express.User) => {
  const order = await orderRepository.findByIdPopulated(id);

  if (!order) throw new AppError("Orders not found", 404);

  if (!isOrderAccessible(order, user)) throw new AppError("Access denied", 403);

  return order;
};

export const placeGuestCODOrder = async (body: GuestCheckoutBody) => {
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

  // Guests have no user id, so per-user limits cannot apply to them.
  const coupon = couponCode
    ? await couponService.evaluateCoupon(couponCode, subtotal, null)
    : null;
  const discount = coupon?.discount ?? 0;

  const totalAmount = Math.max(0, subtotal - discount) + deliveryCharge;

  const newOrder = await couponService.withCouponClaim(couponCode, () =>
    orderRepository.create({
      user: null,
      name,
      email,
      phone,
      paymentType: "cod",
      paymentStatus: "pending",
      orderStatus: "processing",
      deliveryMethod,
      subtotal,
      discount,
      ...(coupon ? { coupon } : {}),
      deliveryCharge,
      totalAmount,
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

  await decrementStock(
    products.map((p) => ({
      product: p.productId,
      variantId: p.variantId,
      size: p.size,
      quantity: p.quantity,
    })),
  );

  await invoiceService.issueInvoiceForOrder(newOrder);

  return {
    orderId: newOrder._id,
    redirectUrl: `${env.CLIENT_URL}/success?orderId=${newOrder._id}`,
  };
};

export const updateOrder = async (
  id: string,
  body: Partial<Pick<IOrder, "orderStatus" | "paymentStatus">>,
) => {
  const order = await orderRepository.findByIdAndUpdate(id, body);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

export const deleteOrder = async (id: string) => {
  const order = await orderRepository.deleteById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return { deleted: true };
};

export const getOrderBySessionId = async (
  sessionId: string,
  user?: Express.User,
) => {
  const order = await orderRepository.findOnePopulated({ sessionId });

  if (!order) throw new AppError("Order doesn't exists", 404);

  if (!isOrderAccessible(order, user)) throw new AppError("Access denied", 403);

  return order;
};
