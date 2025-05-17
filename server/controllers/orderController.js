import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";

export const order = asyncHandler(async (req, res) => {
  const { userId, products, shippingAddress, amountPayable, paymentMethod } =
    req.body;

  if (
    !userId ||
    !products ||
    !shippingAddress ||
    !amountPayable ||
    !paymentMethod
  ) {
    return res.status(401).send("All fields should be entered");
  }

  const newOrder = await Order.create({
    userId,
    products,
    shippingAddress,
    amountPayable,
    paymentMethod,
  });

  if (newOrder) {
    return res.status(201).json({
      userId: newOrder.userId,
      products: newOrder.products,
      shippingAddress: newOrder.shippingAddress,
      amountPayable: newOrder.amountPayable,
      paymentMethod: newOrder.paymentMethod,
    });
  } else {
    return res.status(402).send("Error while placing the order");
  }
});
