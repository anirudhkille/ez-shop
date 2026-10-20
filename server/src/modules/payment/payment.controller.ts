import { asyncHandler } from "@/utils/async-handler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as paymentService from "@/modules/payment/payment.service";

export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.createCheckoutSession(
      req.user!._id,
      req.body,
      req.user!.email,
    );

    return sendResponse(res, 200, "Checkout session created", result);
  },
);

export const createPaymentIntent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.createPaymentIntent(
      req.user!._id,
      req.body,
      req.user!.email,
    );

    return sendResponse(res, 200, "Payment intent created", result);
  },
);

export const abandonPaymentIntent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.abandonPaymentIntent(
      req.user!._id,
      req.body.orderId,
    );

    return sendResponse(res, 200, "Payment abandoned", result);
  },
);

export const createGuestCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.createGuestCheckoutSession(req.body);

    return sendResponse(res, 200, "Checkout session created", result);
  },
);
