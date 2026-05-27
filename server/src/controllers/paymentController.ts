import Stripe from "stripe";
import { asyncHandler } from "@/middlewares/asyncHandler";
import Cart from "@/models/Cart";
import Address from "@/models/Address";
import { Request, Response } from "express";
import Order from "@/models/Order";
import Product from "@/models/Product";

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

export const createGuestCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { products, address, deliveryMethod, name, email, phone } = req.body;

    if (!products || products.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!address)
      return res.status(400).json({ message: "Address is required" });

    const productIds = products.map((p: any) => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(dbProducts.map((p: any) => [p._id.toString(), p]));

    let subtotal = 0;
    const orderProducts: any[] = [];
    const line_items: any[] = [];

    for (const item of products) {
      const prod = productMap.get(item.productId);
      if (!prod || !prod.publish)
        return res.status(400).json({ message: `Product ${item.productId} not found or unavailable` });

      const price = prod.discountPrice || prod.price;
      subtotal += price * item.quantity;

      orderProducts.push({
        product: item.productId,
        quantity: item.quantity,
        price,
      });

      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: prod.name,
            images: [prod.image],
          },
          unit_amount: price * 100,
        },
        quantity: item.quantity,
      });
    }

    let deliveryCharge = 0;
    if (deliveryMethod === "express") deliveryCharge = 120;
    if (deliveryMethod === "same-day") deliveryCharge = 199;

    const total = subtotal + deliveryCharge;

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

    const newOrder = await Order.create({
      user: null,
      name,
      email,
      phone,
      paymentType: "card",
      paymentStatus: "pending",
      orderStatus: "processing",
      deliveryMethod,
      subtotal,
      deliveryCharge,
      totalAmount: total,
      sessionId: "",
      paymentIntentId: "",
      products: orderProducts,
      address: {
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      },
    });

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
        receipt_email: email,
      },
      customer_email: email,
      metadata: {
        orderId: newOrder._id.toString(),
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
