import Stripe from "stripe";
import Cart from "@/modules/cart/cart.model";
import Address from "@/modules/address/address.model";
import Order from "@/modules/order/order.model";
import Product from "@/modules/product/product.model";
import { decrementStock, verifyStock } from "@/modules/product/product.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (userId: string, body: any, userEmail: string) => {
  const { addressId, deliveryMethod } = body;

  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product",
  );

  if (!cart || cart.products.length === 0)
    return { status: 400, data: { message: "Cart is empty" } };

  const shippingAddress = await Address.findById(addressId);
  if (!shippingAddress)
    return { status: 400, data: { message: "Invalid address" } };

  const stockError = await verifyStock(
    cart.products.map((item) => ({
      product: (item.product as any)._id.toString(),
      variantId: item.variantId ? String(item.variantId) : undefined,
      size: item.size,
      quantity: item.quantity,
    })),
  );
  if (stockError) {
    return { status: 400, data: { success: false, message: stockError } };
  }

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
      product: (item.product as any)._id,
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

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/failure`,

      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["IN"],
      },

      payment_intent_data: {
        receipt_email: userEmail,
      },

      customer_email: userEmail,

      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString(),
      },
    });
  } catch (error) {
    await Order.findByIdAndDelete(newOrder._id);
    throw error;
  }

  await decrementStock(
    cart.products.map((item) => ({
      product: (item.product as any)._id,
      variantId: item.variantId ? String(item.variantId) : undefined,
      size: item.size,
      quantity: item.quantity,
    })),
  );

  newOrder.sessionId = session.id;
  await newOrder.save();

  return {
    data: {
      success: true,
      type: "card",
      url: session.url,
    },
  };
};

export const createGuestCheckoutSession = async (body: any) => {
  const { products, address, deliveryMethod, name, email, phone } = body;

  if (!products || products.length === 0)
    return { status: 400, data: { message: "Cart is empty" } };

  if (!address)
    return { status: 400, data: { message: "Address is required" } };

  const productIds = products.map((p: any) => p.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map(
    dbProducts.map((p: any) => [p._id.toString(), p]),
  );

  let subtotal = 0;
  const orderProducts: any[] = [];
  const line_items: any[] = [];

  for (const item of products) {
    const prod = productMap.get(item.productId);
    if (!prod || !prod.publish)
      return { status: 400, data: { message: `Product ${item.productId} not found or unavailable` } };

    const price = prod.discountPrice || prod.price;
    subtotal += price * item.quantity;

    orderProducts.push({
      product: item.productId,
      quantity: item.quantity,
      price,
      variantId: item.variantId,
      size: item.size,
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

  const stockError = await verifyStock(
    products.map((p: any) => ({
      product: p.productId,
      variantId: p.variantId,
      size: p.size,
      quantity: p.quantity,
    })),
  );
  if (stockError) {
    return { status: 400, data: { success: false, message: stockError } };
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

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
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
  } catch (error) {
    await Order.findByIdAndDelete(newOrder._id);
    throw error;
  }

  await decrementStock(
    orderProducts.map((p) => ({
      product: p.product,
      variantId: p.variantId,
      size: p.size,
      quantity: p.quantity,
    })),
  );

  newOrder.sessionId = session.id;
  await newOrder.save();

  return {
    data: {
      success: true,
      type: "card",
      url: session.url,
    },
  };
};
