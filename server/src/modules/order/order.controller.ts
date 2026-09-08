import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as orderService from "@/modules/order/order.service";
import {
  addressDeliverySchema,
  guestCheckoutSchema,
} from "@/validators/checkout.validator";

const formatZodError = (error: any) =>
  error.errors.map((e: any) => e.message).join(", ");

export const placeCODOrder = asyncHandler(async (req: any, res) => {
  const parsed = addressDeliverySchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: formatZodError(parsed.error) });
  }

  const result = await orderService.placeCODOrder(req.user._id, parsed.data);
  res.status(result.status || 200).json(result.data);
});

export const getOrders = asyncHandler(async (req: any, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const result = await orderService.getOrders(limit, page);
  res.status(result.status || 200).json(result.data);
});

export const getMyOrder = asyncHandler(async (req: any, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const result = await orderService.getMyOrder(req.user._id, limit, page);
  res.status(result.status || 200).json(result.data);
});

export const getOrderById = asyncHandler(
  async (req: any, res: Response) => {
    const result = await orderService.getOrderById(req.params.id, req.user);
    res.status(result.status || 200).json(result.data);
  },
);

export const placeGuestCODOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = guestCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(parsed.error) });
    }

    const result = await orderService.placeGuestCODOrder(parsed.data);
    res.status(result.status || 200).json(result.data);
  },
);

export const getOrderBySessionId = asyncHandler(
  async (req: any, res: Response) => {
    const result = await orderService.getOrderBySessionId(
      req.params.sessionId,
      req.user,
    );
    res.status(result.status || 200).json(result.data);
  },
);
