import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as newsletterService from "@/modules/newsletter/newsletter.service";

export const subscribeNewsletter = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await newsletterService.subscribeNewsletter(email);

    return sendResponse(res, 201, "Newsletter subscribed successfully", result);
  },
);

export const getNewsletterSubscribers = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const result = await newsletterService.getNewsletterSubscribers(
      limit,
      page,
    );

    return sendResponse(
      res,
      200,
      "Newsletter subscribers fetched successfully",
      result.items,
      result.pagination,
    );
  },
);
