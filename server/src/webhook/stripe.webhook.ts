import Stripe from "stripe";
import express, { Request, Response } from "express";
import {
  markOrderPaid,
  markOrderPaymentFailed,
} from "@/modules/order/order.payment";
import { env } from "@/config/env.config";
import { Sentry, sentryEnabled } from "@/config/sentry";

const router = express.Router();
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

/** Maps a Stripe event to the order in its metadata. */
const orderIdFrom = (metadata: Record<string, string> | null | undefined) =>
  metadata?.orderId;

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

    const orderId = (() => {
      switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.expired": {
          const session = event.data.object as unknown as {
            metadata?: Record<string, string>;
          };
          return orderIdFrom(session.metadata) ?? null;
        }
        case "payment_intent.succeeded":
        case "payment_intent.payment_failed": {
          const intent = event.data.object as unknown as {
            metadata?: Record<string, string>;
          };
          return orderIdFrom(intent.metadata) ?? null;
        }
        default:
          return null;
      }
    })();

    if (!orderId) return res.status(200).send("OK");

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as unknown as {
            payment_intent?: string | null;
          };
          await markOrderPaid(orderId, session.payment_intent);
          break;
        }
        case "payment_intent.succeeded": {
          const intent = event.data.object as unknown as { id: string };
          await markOrderPaid(orderId, intent.id);
          break;
        }
        // Abandoned session and refused card have the same outcome: no money.
        case "checkout.session.expired":
        case "payment_intent.payment_failed": {
          await markOrderPaymentFailed(orderId);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      if (sentryEnabled) {
        Sentry.withScope((scope) => {
          scope.setTag("route", "/webhook");
          scope.setTag("stripeEventType", event.type);
          scope.setTag("orderId", orderId);
          Sentry.captureException(err);
        });
      }

      return res
        .status(500)
        .send(`Webhook processing error: ${(err as Error).message}`);
    }

    res.status(200).send("OK");
  },
);

export default router;
