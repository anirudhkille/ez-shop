import { Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as cartService from "@/modules/cart/cart.service";

export const getCart = asyncHandler(async (req: any, res: Response) => {
  const result = await cartService.getCart(req.user._id);

  return res.status(result.status || 200).json({
    success: true,
    data: result.data,
  });
});

export const addToCart = asyncHandler(async (req: any, res: Response) => {
  const result = await cartService.addToCart(req.user._id, req.body);

  return res.status(result.status || 200).json(result.data);
});

export const updateQuantity = asyncHandler(async (req: any, res: Response) => {
  const { cartItemId, quantity } = req.body;
  const result = await cartService.updateQuantity(req.user._id, cartItemId, quantity);

  return res.status(result.status || 200).json(result.data);
});

export const removeFromCart = asyncHandler(async (req: any, res: Response) => {
  const result = await cartService.removeFromCart(req.user._id, req.params.cartItemId);

  return res.status(result.status || 200).json(result.data);
});

export const clearCart = asyncHandler(async (req: any, res: Response) => {
  const result = await cartService.clearCart(req.user._id);

  res.status(200).json(result.data);
});

export const getCartItemCount = asyncHandler(
  async (req: any, res: Response) => {
    const result = await cartService.getCartItemCount(req.user._id);

    return res.json(result.data);
  },
);
