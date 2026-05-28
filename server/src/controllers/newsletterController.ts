import { asyncHandler } from "@/middlewares/asyncHandler";
import Newsletter from "@/models/Newsletter";
import { Request, Response } from "express";

export const subscribeNewsletter = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const alerdySubscribed = await Newsletter.findOne({ email }).lean();

    if (alerdySubscribed) {
      return res.status(401).json({
        success: true,
        message: "Email already subscribed for newsletter",
      });
    }

    const newsletter = await Newsletter.create({
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Newsletter subscribed successfully",
      data: newsletter,
    });
  },
);

export const getNewsletterSubscribers = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      Newsletter.find().skip(skip).limit(limit).lean(),
      Newsletter.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Newsletter subscribers fetched successfully",
      data: subscribers,
      pagintion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  },
);
