import { env } from "@/config/env.config";
import { logger } from "@/config/logger";
import type { Types } from "mongoose";
import { orderConfirmationTemplate } from "@/templates/order-confirmation.template";
import * as orderRepository from "@/modules/order/order.repository";
import * as userRepository from "@/modules/user/user.repository";
import { sendEmail } from "@/services/email.service";

const productName = (product: unknown): string => {
  if (product && typeof product === "object") {
    const candidate = product as { name?: unknown };

    if (typeof candidate.name === "string" && candidate.name) {
      return candidate.name;
    }
  }

  return "Product";
};

const resolveRecipient = async (order: {
  user?: unknown;
  email?: string | null;
}): Promise<string | null> => {
  if (order.email) return order.email;

  const raw = order.user as { _id?: unknown } | string | null | undefined;
  const userId =
    raw && typeof raw === "object" ? String(raw._id ?? "") : String(raw ?? "");

  if (!userId) return null;

  const user = await userRepository.findById(userId, "email");

  return user?.email ?? null;
};

/**
 * Sends the order confirmation. Never throws: the order is already persisted
 * and stock already claimed by the time this runs, so failing the request would
 * tell the customer their purchase failed when it succeeded.
 */
export const sendOrderConfirmation = async (
  orderId: string | Types.ObjectId,
): Promise<void> => {
  try {
    const order = await orderRepository.findByIdPopulated(orderId);

    if (!order) {
      logger.warn({ orderId }, "Order confirmation skipped: order not found");
      return;
    }

    const to = await resolveRecipient(
      order as unknown as {
        user?: unknown;
        email?: string | null;
      },
    );

    if (!to) {
      logger.warn({ orderId }, "Order confirmation skipped: no recipient");
      return;
    }

    const coupon = order.coupon as
      | string
      | { code?: string | null }
      | null
      | undefined;
    const address = order.address as Record<string, unknown> | undefined;
    const str = (value: unknown) =>
      typeof value === "string" && value ? value : undefined;

    await sendEmail({
      to,
      subject: `Your EZ Shop order #${String(order._id).slice(-6).toUpperCase()}`,
      html: orderConfirmationTemplate(
        {
          id: String(order._id),
          name: str(order.name),
          items: (order.products ?? []).map((item) => ({
            name: productName(item.product),
            quantity: item.quantity,
            price: item.price,
            size: str(item.size),
          })),
          subtotal: order.subtotal ?? 0,
          discount: order.discount ?? undefined,
          couponCode: str(typeof coupon === "string" ? coupon : coupon?.code),
          deliveryCharge: order.deliveryCharge ?? undefined,
          total: order.totalAmount ?? 0,
          deliveryMethod: str(order.deliveryMethod),
          paymentType: str(order.paymentType),
          address: address
            ? {
                name: str(address.name),
                addressLine1: str(address.addressLine1),
                addressLine2: str(address.addressLine2),
                city: str(address.city),
                state: str(address.state),
                zipCode: str(address.zipCode),
                country: str(address.country),
                phone: str(address.phone),
              }
            : undefined,
        },
        `${env.CLIENT_URL}/track-order`,
      ),
    });
  } catch (error) {
    logger.error({ orderId, error }, "Order confirmation email failed");
  }
};
