import * as cartRepository from "@/modules/cart/cart.repository";
import * as invoiceService from "@/modules/invoice/invoice.service";
import * as orderRepository from "@/modules/order/order.repository";
import { claimStockForOrder } from "@/modules/order/order.intent";
import { sendOrderConfirmation } from "@/modules/order/order.email";

/** Only the Stripe webhook settles a card sale; flags make retries safe. */
export const markOrderPaid = async (
  orderId: string,
  paymentIntentId?: string | null,
) => {
  const order = await orderRepository.findById(orderId);

  if (!order) return;

  if (
    order.paymentStatus !== "paid" ||
    (paymentIntentId && order.paymentIntentId !== paymentIntentId)
  ) {
    order.paymentStatus = "paid";

    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }

    await order.save();
  }

  // Both events can arrive together, so the database picks the winner.
  if (await orderRepository.claimStockFlag(orderId)) {
    await claimStockForOrder(order.products);
  }

  if (order.user) {
    await cartRepository.clearProducts(String(order.user));
  }

  if (await orderRepository.claimConfirmationFlag(orderId)) {
    await invoiceService.issueInvoiceForOrder(order);
    await sendOrderConfirmation(order._id);
  }
};

/** Abandoned or refused payment: no stock was claimed, so only state changes. */
export const markOrderPaymentFailed = async (orderId: string) => {
  const order = await orderRepository.findById(orderId);

  if (!order || order.paymentStatus === "paid") return;

  order.paymentStatus = "failed";
  await order.save();
};
