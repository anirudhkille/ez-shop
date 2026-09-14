import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as orderService from "@/modules/order/order.service";

export const placeCODOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.placeCODOrder(req.user!._id, req.body);
    res.status(result.status || 200).json(result.data);
  },
);

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const result = await orderService.getOrders(limit, page);
  res.status(result.status || 200).json(result.data);
});

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const result = await orderService.getMyOrder(req.user!._id, limit, page);
  res.status(result.status || 200).json(result.data);
});

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.getOrderById(req.params.id, req.user);
    res.status(result.status || 200).json(result.data);
  },
);

export const placeGuestCODOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.placeGuestCODOrder(req.body);
    res.status(result.status || 200).json(result.data);
  },
);

export const getOrderBySessionId = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.getOrderBySessionId(
      req.params.sessionId,
      req.user,
    );
    res.status(result.status || 200).json(result.data);
  },
);

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.updateOrder(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result.order,
  });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.deleteOrder(req.params.id);
  res.status(200).json({ success: true, message: result.message });
});
