import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import * as cartService from "@/modules/cart/cart.service";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.getCart(req.user!._id);

  return sendResponse(res, 200, "Cart fetched successfully", result);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.addToCart(req.user!._id, req.body);

  return sendResponse(res, 200, "Added to cart", result);
});

export const updateQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartItemId, quantity } = req.body;
    const result = await cartService.updateQuantity(
      req.user!._id,
      cartItemId,
      quantity,
    );

    return sendResponse(res, 200, "Quantity updated", result);
  },
);

export const removeFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await cartService.removeFromCart(
      req.user!._id,
      req.params.cartItemId,
    );

    return sendResponse(res, 200, "Item removed", result);
  },
);

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.clearCart(req.user!._id);

  return sendResponse(res, 200, "Cart cleared", result);
});

export const getCartItemCount = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await cartService.getCartItemCount(req.user!._id);

    return sendResponse(res, 200, "Cart count fetched", result);
  },
);
