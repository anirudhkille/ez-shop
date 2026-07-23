import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as newsletterService from "@/modules/newsletter/newsletter.service";

export const subscribeNewsletter = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await newsletterService.subscribeNewsletter(email);
    return res.status(result.status || 200).json(result.data);
  },
);

export const getNewsletterSubscribers = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const result = await newsletterService.getNewsletterSubscribers(limit, page);
    return res.status(200).json(result.data);
  },
);
