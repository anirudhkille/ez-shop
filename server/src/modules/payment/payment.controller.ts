import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as paymentService from "@/modules/payment/payment.service";

export const createCheckoutSession = asyncHandler(
  async (req: any, res: Response) => {
    const result = await paymentService.createCheckoutSession(req.user._id, req.body, req.user.email);
    res.status(result.status || 200).json(result.data);
  },
);

export const createGuestCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.createGuestCheckoutSession(req.body);
    res.status(result.status || 200).json(result.data);
  },
);
