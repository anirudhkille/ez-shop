import { asyncHandler } from "../middlewares/asyncHandler";
import Order from "../models/Order";
import { Request, Response } from "express";

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
    const order = await Order.findById(req.params.id);

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
