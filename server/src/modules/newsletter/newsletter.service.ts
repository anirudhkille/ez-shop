import * as newsletterRepository from "@/modules/newsletter/newsletter.repository";

export const subscribeNewsletter = async (email: string) => {
  const alerdySubscribed = await newsletterRepository.findOne({ email });

  if (alerdySubscribed) {
    return { status: 401, data: { success: true, message: "Email already subscribed for newsletter" } };
  }

  const newsletter = await newsletterRepository.create({ email });

  return { status: 201, data: { success: true, message: "Newsletter subscribed successfully", data: newsletter } };
};

export const getNewsletterSubscribers = async (limit: number, page: number) => {
  const skip = (page - 1) * limit;

  const [subscribers, total] = await Promise.all([
    newsletterRepository.find(skip, limit),
    newsletterRepository.countDocuments(),
  ]);

  return {
    data: {
      success: true,
      message: "Newsletter subscribers fetched successfully",
      data: subscribers,
      pagintion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};
