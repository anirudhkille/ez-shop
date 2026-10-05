import { asyncHandler } from "@/utils/async-handler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as couponService from "@/modules/coupon/coupon.service";

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  const userId = req.user?._id?.toString();

  const result = await couponService.evaluateCoupon(code, subtotal, userId);

  return sendResponse(res, 200, "Coupon applied", result);
});

export const postCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.createCoupon(req.body);

  return sendResponse(res, 201, "Coupon created successfully", result);
});

export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
  };

  const result = await couponService.getCoupons(page, limit, search);

  return sendResponse(
    res,
    200,
    "Coupons fetched successfully",
    result.items,
    result.pagination,
  );
});

export const getCouponById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await couponService.getCouponById(req.params.id);

    return sendResponse(res, 200, "Coupon fetched successfully", result);
  },
);

export const updateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await couponService.updateCoupon(req.params.id, req.body);

    return sendResponse(res, 200, "Coupon updated successfully", result);
  },
);

export const deleteCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    await couponService.deleteCoupon(req.params.id);

    return sendResponse(res, 200, "Coupon deleted successfully", {
      deleted: true,
    });
  },
);
