import Stripe from "stripe";
import express, { Request, Response } from "express";
import * as orderRepository from "@/modules/order/order.repository";
import * as cartRepository from "@/modules/cart/cart.repository";
import { env } from "@/config/env.config";

const router = express.Router();
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as unknown as {
        metadata?: { orderId?: string };
        payment_intent?: string;
      };

      const orderId = session.metadata?.orderId;
      if (!orderId) return res.status(200).send("OK");

      try {
        const order = await orderRepository.findById(orderId);
        if (!order) return res.status(200).send("OK");

        if (order.paymentStatus === "paid") return res.status(200).send("OK");

        order.paymentStatus = "paid";
        order.paymentIntentId = session.payment_intent;
        order.orderStatus = "processing";
        if (order.user) {
          await cartRepository.clearProducts(String(order.user));
        }

        await order.save();
      } catch (err) {
        return res
          .status(500)
          .send(`Webhook processing error: ${(err as Error).message}`);
      }
    }

    res.status(200).send("OK");
  },
);

export default router;
