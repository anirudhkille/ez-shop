import Cart from "@/modules/cart/cart.model";
import Address from "@/modules/address/address.model";
import Product from "@/modules/product/product.model";
import * as orderRepository from "@/modules/order/order.repository";

export const placeCODOrder = async (userId: string, body: any) => {
  const { addressId, deliveryMethod } = body;

  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product",
  );
  if (!cart || cart.products.length === 0)
    return { status: 400, data: { success: false, message: "Cart is empty" } };

  const address = await Address.findById(addressId);
  if (!address) return { status: 400, data: { success: false, message: "Invalid address" } };

  const subtotal = cart.products.reduce((sum: number, item: any) => {
    return (
      sum + (item.product.discountPrice || item.product.price) * item.quantity
    );
  }, 0);

  let deliveryCharge = 0;
  if (deliveryMethod === "express") deliveryCharge = 120;
  if (deliveryMethod === "same-day") deliveryCharge = 199;

  const totalAmount = subtotal + deliveryCharge;

  const newOrder = await orderRepository.create({
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

  return {
    status: 200,
    data: {
      success: true,
      message: "Order placed with Cash on Delivery",
      orderId: newOrder._id,
      redirectUrl: `${process.env.CLIENT_URL}/success?orderId=${newOrder._id}`,
    },
  };
};

export const getOrders = async (limit: number, page: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    orderRepository.find(skip, limit),
    orderRepository.countDocuments(),
  ]);

  return {
    status: 200,
    data: {
      success: true,
      message: "Orders fetched successfully",
      data: orders,
      pagintion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};

export const getMyOrder = async (userId: string, limit: number, page: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    orderRepository.findByUser(userId, skip, limit),
    orderRepository.countByUser(userId),
  ]);

  if (orders.length === 0)
    return { status: 404, data: { success: false, message: "Orders not found" } };

  return {
    status: 200,
    data: {
      success: true,
      message: "My orders fetched successfully",
      data: orders,
      pagintion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};

export const getOrderById = async (id: string) => {
  const order = await orderRepository.findByIdPopulated(id);

  if (!order)
    return { status: 404, data: { success: false, message: "Orders not found" } };

  return {
    status: 200,
    data: {
      success: true,
      message: "Order fetched successfully",
      data: order,
    },
  };
};

export const placeGuestCODOrder = async (body: any) => {
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
    });
  }

  let deliveryCharge = 0;
  if (deliveryMethod === "express") deliveryCharge = 120;
  if (deliveryMethod === "same-day") deliveryCharge = 199;

  const totalAmount = subtotal + deliveryCharge;

  const newOrder = await orderRepository.create({
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

  return {
    status: 200,
    data: {
      success: true,
      message: "Order placed with Cash on Delivery",
      orderId: newOrder._id,
      redirectUrl: `${process.env.CLIENT_URL}/success?orderId=${newOrder._id}`,
    },
  };
};

export const getOrderBySessionId = async (sessionId: string) => {
  const order = await orderRepository.findOnePopulated({ sessionId });

  if (!order)
    return { status: 404, data: { success: false, message: "Order doesn't exists" } };

  return {
    status: 200,
    data: {
      success: true,
      message: "Order fetched succesfully",
      data: order,
    },
  };
};
