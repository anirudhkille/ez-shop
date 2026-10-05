import * as cartRepository from "@/modules/cart/cart.repository";
import mongoose from "mongoose";
import { env } from "@/config/env.config";
import * as orderRepository from "@/modules/order/order.repository";
import {
  claimStock,
  createPricedOrder,
  priceCart,
  priceGuestLines,
  requireGuestAddress,
  resolveSavedAddress,
  type GuestCheckoutBody,
} from "@/modules/order/order.intent";
import { IOrder } from "@/modules/order/order.model";
import { AppError } from "@/utils/app-error";
import * as invoiceService from "@/modules/invoice/invoice.service";
import { sendOrderConfirmation } from "@/modules/order/order.email";

interface CODRequestBody {
  addressId: string;
  deliveryMethod: string;
  couponCode?: string;
}

export const placeCODOrder = async (userId: string, body: CODRequestBody) => {
  const { addressId, deliveryMethod, couponCode } = body;

  const lines = await priceCart(userId);
  const address = await resolveSavedAddress(addressId);

  const { order } = await createPricedOrder({
    lines,
    buyer: { kind: "user", userId },
    address,
    deliveryMethod,
    couponCode,
    paymentType: "cod",
  });

  await claimStock(lines);
  await cartRepository.clearProducts(userId);
  await invoiceService.issueInvoiceForOrder(order);
  await sendOrderConfirmation(order._id);

  return {
    orderId: order._id,
    redirectUrl: `${env.CLIENT_URL}/success?orderId=${order._id}`,
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

  const shippingAddress = requireGuestAddress(address);
  const lines = await priceGuestLines(products);

  const { order } = await createPricedOrder({
    lines,
    buyer: { kind: "guest", name, email, phone },
    address: shippingAddress,
    deliveryMethod,
    couponCode,
    paymentType: "cod",
  });

  await claimStock(lines);
  await invoiceService.issueInvoiceForOrder(order);
  await sendOrderConfirmation(order._id);

  return {
    orderId: order._id,
    redirectUrl: `${env.CLIENT_URL}/success?orderId=${order._id}`,
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
