import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Product from "@/models/Product";

export const placeCODOrder = asyncHandler(async (req: any, res) => {
  const userId = req.user._id;
  const { addressId, deliveryMethod } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product"
  );
  if (!cart || cart.products.length === 0)
    return res.status(400).json({ message: "Cart is empty" });

  const address = await Address.findById(addressId);
  if (!address) return res.status(400).json({ message: "Invalid address" });

  const subtotal = cart.products.reduce((sum: number, item: any) => {
    return (
      sum + (item.product.discountPrice || item.product.price) * item.quantity
    );
  }, 0);

  let deliveryCharge = 0;
  if (deliveryMethod === "express") deliveryCharge = 120;
  if (deliveryMethod === "same-day") deliveryCharge = 199;

  const totalAmount = subtotal + deliveryCharge;

  const newOrder = await Order.create({
    user: userId,
    paymentType: "cod",
    paymentStatus: "pending",
    orderStatus: "processing",
    deliveryMethod,
    subtotal,
    deliveryCharge,
    totalAmount,

    products: cart.products.map((item) => ({
      product: (item.product as any)._id,
      quantity: item.quantity,
      price: item.discountPriceAtPurchase ?? item.priceAtPurchase,
    })),

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

  await Cart.updateOne({ user: userId }, { $set: { products: [] } });

  res.json({
    success: true,
    message: "Order placed with Cash on Delivery",
    orderId: newOrder._id,
    redirectUrl: `${process.env.CLIENT_URL}/success?orderId=${newOrder._id}`,
  });
});

export const getOrders = asyncHandler(async (req: any, res: Response) => {
  const { _id } = req.user;
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find().skip(skip).limit(limit),
    Order.countDocuments(),
  ]);

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: orders,
    pagintion: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getMyOrder = asyncHandler(async (req: any, res: Response) => {
  const { _id } = req.user;
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: _id }).skip(skip).limit(limit),
    Order.countDocuments({ user: _id }),
  ]);

  if (orders.length === 0)
    return res.status(404).json({
      success: false,
      message: "Orders not found",
    });

  return res.status(200).json({
    success: true,
    message: "My orders fetched successfully",
    data: orders,
    pagintion: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate(
      "products.product",
      "name image price slug"
    );

    if (!order)
      return res.status(404).json({
        success: false,
        message: "Orders not found",
      });

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  }
);

export const placeGuestCODOrder = asyncHandler(async (req: Request, res: Response) => {
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
  }

  let deliveryCharge = 0;
  if (deliveryMethod === "express") deliveryCharge = 120;
  if (deliveryMethod === "same-day") deliveryCharge = 199;

  const totalAmount = subtotal + deliveryCharge;

  const newOrder = await Order.create({
    user: null,
    name,
    email,
    phone,
    paymentType: "cod",
    paymentStatus: "pending",
    orderStatus: "processing",
    deliveryMethod,
    subtotal,
    deliveryCharge,
    totalAmount,
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

  res.json({
    success: true,
    message: "Order placed with Cash on Delivery",
    orderId: newOrder._id,
    redirectUrl: `${process.env.CLIENT_URL}/success?orderId=${newOrder._id}`,
  });
});

export const getOrderBySessionId = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findOne({ sessionId: req.params.sessionId }).populate(
      "products.product",
      "name image price slug"
    );

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order doesn't exists" });

    return res.json({
      success: true,
      message: "Order fetched succesfully",
      data: order,
    });
  }
);

