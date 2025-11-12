import Stripe from "stripe";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Request, Response } from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartItems, shippingAddress, userId, shippingCharge } = req.body;

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const amountPayable = subtotal + shippingCharge;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId,
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(cartItems),
        subtotal: String(subtotal),
        shippingCharge: String(shippingCharge),
        amountPayable: String(amountPayable),
      },
    });

    res.json({ url: session.url });
  }
);
