import { AppError } from "@/utils/appError";
import * as couponRepository from "@/modules/coupon/coupon.repository";
import * as orderRepository from "@/modules/order/order.repository";
import type { ICoupon } from "@/modules/coupon/coupon.model";

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const createCoupon = async (data: Partial<ICoupon>) => {
  const existing = await couponRepository.findByCode(data.code as string);

  if (existing) {
    throw new AppError("A coupon with this code already exists", 409);
  }

  return await couponRepository.create(data);
};

export const getCoupons = async (page = 1, limit = 10, search?: string) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    couponRepository.findAll(skip, limit, search),
    couponRepository.countDocuments(search),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCouponById = async (id: string) => {
  const coupon = await couponRepository.findById(id);

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  return coupon;
};

export const updateCoupon = async (id: string, data: Partial<ICoupon>) => {
  const updated = await couponRepository.updateById(id, data);

  if (!updated) {
    throw new AppError("Coupon not found", 404);
  }

  return updated;
};

export const deleteCoupon = async (id: string) => {
  const deleted = await couponRepository.deleteById(id);

  if (!deleted) {
    throw new AppError("Coupon not found", 404);
  }

  return deleted;
};

const assertUsable = (coupon: ICoupon, subtotal: number): void => {
  if (!coupon.active) {
    throw new AppError("This coupon is no longer active", 400);
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new AppError("This coupon has expired", 400);
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError("This coupon has reached its usage limit", 400);
  }

  const minimum = coupon.minOrderValue ?? 0;

  if (subtotal < minimum) {
    throw new AppError(
      `This coupon requires a minimum order of ₹${minimum}`,
      400,
    );
  }
};

/**
 * Pure discount maths, exported so it can be unit tested without a database.
 * `coupon` only needs the fields that affect the amount.
 */
export const computeDiscount = (
  coupon: Pick<ICoupon, "type" | "value" | "maxDiscountAmount">,
  subtotal: number,
): number => {
  const raw =
    coupon.type === "percentage"
      ? (subtotal * coupon.value) / 100
      : coupon.value;

  const capped =
    coupon.maxDiscountAmount != null
      ? Math.min(raw, coupon.maxDiscountAmount)
      : raw;

  // Never discount below zero, and never exceed the subtotal itself.
  return round2(Math.max(0, Math.min(capped, subtotal)));
};

/**
 * Validates a coupon against an order subtotal and returns the discount.
 * Throws AppError with a customer-readable reason when the coupon cannot be used.
 */
export const evaluateCoupon = async (
  code: string,
  subtotal: number,
  userId?: string | null,
) => {
  const coupon = await couponRepository.findByCode(code);

  if (!coupon) {
    throw new AppError("Invalid coupon code", 400);
  }

  assertUsable(coupon, subtotal);

  if (coupon.maxUsesPerUser != null && userId) {
    const used = await orderRepository.countByUserAndCoupon(
      userId,
      coupon.code,
    );

    if (used >= coupon.maxUsesPerUser) {
      throw new AppError(
        "You have already used this coupon the maximum number of times",
        400,
      );
    }
  }

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount: computeDiscount(coupon, subtotal),
  };
};

/**
 * Claims a use of the coupon. Call after the order is persisted so a failed
 * order never burns a use. Returns false if the coupon was exhausted in the
 * meantime, in which case the caller must abandon the order.
 */
export const claimCouponUse = async (code: string): Promise<boolean> => {
  const coupon = await couponRepository.findByCode(code);

  if (!coupon) return false;

  const claimed = await couponRepository.claimUse(String(coupon._id));

  return claimed !== null;
};

export const releaseCouponUse = async (code: string): Promise<void> => {
  const coupon = await couponRepository.findByCode(code);

  if (coupon) {
    await couponRepository.releaseUse(String(coupon._id));
  }
};

/**
 * Creates the order while holding a claim on the coupon's usage.
 *
 * The claim is taken before the write so a coupon that ran out mid-checkout
 * never produces an order, and it is released again if the write throws so a
 * failed order never burns a redemption.
 */
export const withCouponClaim = async <T>(
  code: string | undefined,
  create: () => Promise<T>,
): Promise<T> => {
  if (!code) return create();

  const claimed = await claimCouponUse(code);

  if (!claimed) {
    throw new AppError("This coupon has just reached its usage limit", 400);
  }

  try {
    return await create();
  } catch (error) {
    await releaseCouponUse(code);
    throw error;
  }
};
