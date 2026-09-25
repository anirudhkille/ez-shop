import { AppError } from "@/utils/appError";
import * as newsletterRepository from "@/modules/newsletter/newsletter.repository";

export const subscribeNewsletter = async (email: string) => {
  const alreadySubscribed = await newsletterRepository.findOne({ email });

  if (alreadySubscribed) {
    throw new AppError("Email already subscribed for newsletter", 401);
  }

  const newsletter = await newsletterRepository.create({ email });

  return newsletter;
};

export const getNewsletterSubscribers = async (limit: number, page: number) => {
  const skip = (page - 1) * limit;

  const [subscribers, total] = await Promise.all([
    newsletterRepository.find(skip, limit),
    newsletterRepository.countDocuments(),
  ]);

  return {
    items: subscribers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
