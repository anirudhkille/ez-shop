import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as paymentService from "@/modules/payment/payment.service";
import {
  addressDeliverySchema,
  guestCheckoutSchema,
} from "@/validators/checkout.validator";

const formatZodError = (error: any) =>
  error.errors.map((e: any) => e.message).join(", ");

export const createCheckoutSession = asyncHandler(
  async (req: any, res: Response) => {
    const parsed = addressDeliverySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(parsed.error) });
    }

    const result = await paymentService.createCheckoutSession(
      req.user._id,
      parsed.data,
      req.user.email,
    );
    res.status(result.status || 200).json(result.data);
  },
);

export const createGuestCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = guestCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(parsed.error) });
    }

    const result = await paymentService.createGuestCheckoutSession(parsed.data);
    res.status(result.status || 200).json(result.data);
  },
);
