import Stripe from "stripe";
import { asyncHandler } from "@/middlewares/asyncHandler";
import Cart from "@/models/Cart";
import Address from "@/models/Address";
import { Request, Response } from "express";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = asyncHandler(
  async (req: any, res: Response) => {
    const userId = req.user._id;
    const { addressId, deliveryMethod } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    if (!cart || cart.products.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const shippingAddress = await Address.findById(addressId);
    if (!shippingAddress)
      return res.status(400).json({ message: "Invalid address" });

    const subtotal = cart.products.reduce((acc, item) => {
      const price = item.discountPriceAtPurchase ?? item.priceAtPurchase;
      return acc + price * item.quantity;
    }, 0);

    let deliveryCharge = 0;
    if (deliveryMethod === "express") deliveryCharge = 120;
    if (deliveryMethod === "same-day") deliveryCharge = 199;

    const total = subtotal + deliveryCharge;

    const newOrder = await Order.create({
      user: userId,
      paymentType: "card",
      paymentStatus: "pending",
      orderStatus: "processing",
      deliveryMethod,
      subtotal,
      deliveryCharge,
      totalAmount: total,

      sessionId: "",
      paymentIntentId: "",

      products: cart.products.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.discountPriceAtPurchase ?? item.priceAtPurchase,
      })),

      address: {
        name: shippingAddress.name,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
    });

    const line_items = cart.products.map((item) => {
      const product: any = item.product;
      const price = item.discountPriceAtPurchase ?? item.priceAtPurchase;

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: price * 100,
        },
        quantity: item.quantity,
      };
    });

    if (deliveryCharge > 0) {
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: `Delivery (${deliveryMethod})`,
            images: [],
          },
          unit_amount: deliveryCharge * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/failure`,

      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["IN"],
      },

      payment_intent_data: {
        receipt_email: req.user.email,
      },

      customer_email: req.user.email,

      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString(),
      },
    });

    newOrder.sessionId = session.id;
    await newOrder.save();

    res.json({
      success: true,
      type: "card",
      url: session.url,
    });
  }
);
