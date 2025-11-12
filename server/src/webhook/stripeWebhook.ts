import Stripe from "stripe";
import express, { Request, Response } from "express";
import Order from "../models/Order";

const router = express.Router();

// ✅ Always include API version for type safety
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    // ✅ Fix #1: Make sure 'sig' is defined and properly typed
    if (!sig) {
      return res.status(400).send("Missing Stripe signature");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string | Buffer,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: unknown) {
      // ✅ Fix #2: Type-safe catch
      if (err instanceof Error) {
        console.error("⚠️ Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      console.error("⚠️ Unknown Webhook Error:", err);
      return res.status(400).send("Unknown webhook error");
    }

    // ✅ Handle successful checkout sessions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // ✅ Fix #3: Stripe metadata can be null
      if (!session.metadata) {
        console.error("❌ Missing metadata in Stripe session");
        return res.status(400).send("Session metadata missing");
      }

      // ✅ Fix #4: Parse metadata safely
      let cartItems: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
        image: string;
      }> = [];

      let shippingAddress: Record<string, any> = {};

      try {
        cartItems = JSON.parse(session.metadata.cartItems || "[]");
        shippingAddress = JSON.parse(session.metadata.shippingAddress || "{}");
      } catch (parseError) {
        console.error("❌ Failed to parse metadata JSON:", parseError);
        return res.status(400).send("Invalid metadata format");
      }

      // ✅ Fix #5: Strong typing for 'item'
      await Order.create({
        user: session.metadata.userId,
        products: cartItems.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingAddress,
        subtotal: Number(session.metadata.subtotal),
        shippingCharge: Number(session.metadata.shippingCharge),
        amountPayable: Number(session.metadata.amountPayable),
        paymentMethod: "Card",
        orderStatus: "Processing",
      });

      console.log("✅ Order saved successfully from Stripe session");
    }

    res.status(200).send();
  }
);

export default router;
