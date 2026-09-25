import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import * as orderService from "@/modules/order/order.service";

export const placeCODOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.placeCODOrder(req.user!._id, req.body);

    return sendResponse(res, 201, "Order placed with Cash on Delivery", result);
  },
);

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const result = await orderService.getOrders(limit, page);

  return sendResponse(
    res,
    200,
    "Orders fetched successfully",
    result.items,
    result.pagination,
  );
});

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const result = await orderService.getMyOrder(req.user!._id, limit, page);

  return sendResponse(
    res,
    200,
    "My orders fetched successfully",
    result.items,
    result.pagination,
  );
});

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.getOrderById(req.params.id, req.user);

    return sendResponse(res, 200, "Order fetched successfully", result);
  },
);

export const placeGuestCODOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.placeGuestCODOrder(req.body);

    return sendResponse(res, 201, "Order placed with Cash on Delivery", result);
  },
);

export const getOrderBySessionId = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await orderService.getOrderBySessionId(
      req.params.sessionId,
      req.user,
    );

    return sendResponse(res, 200, "Order fetched successfully", result);
  },
);

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.updateOrder(req.params.id, req.body);

  return sendResponse(res, 200, "Order updated successfully", result);
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.deleteOrder(req.params.id);

  return sendResponse(res, 200, "Order deleted successfully", result);
});
