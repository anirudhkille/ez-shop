import Stripe from "stripe";
import Order from "@/modules/order/order.model";
import express from "express";
import Cart from "@/modules/cart/cart.model";
import { env } from "@/config/env.config";

const router = express.Router();
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;

      try {
        const order = await Order.findById(session.metadata.orderId);
        if (!order) return res.status(200).send("OK");

        if (order.paymentStatus === "paid") return res.status(200).send("OK");

        order.paymentStatus = "paid";
        order.paymentIntentId = session.payment_intent;
        order.orderStatus = "processing";
        if (order.user) {
          await Cart.updateOne({ user: order.user }, { $set: { products: [] } });
        }

        await order.save();
      } catch (err: any) {
        return res.status(500).send(`Webhook processing error: ${err.message}`);
      }
    }

    res.status(200).send("OK");
  },
);

export default router;
