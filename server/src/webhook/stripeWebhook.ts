import Stripe from "stripe";
import Order from "@/models/Order";
import express from "express";
import Cart from "@/models/Cart";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;

      const order = await Order.findById(session.metadata.orderId);
      if (!order) return res.status(404).send("Order not found");

      order.paymentStatus = "paid";
      order.paymentIntentId = session.payment_intent;
      order.orderStatus = "processing";
      if (order.user) {
        await Cart.updateOne({ user: order.user }, { $set: { products: [] } });
      }

      await order.save();
    }

    res.status(200).send("OK");
  }
);

export default router;
