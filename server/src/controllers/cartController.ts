import Cart from "../models/Cart";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Request, Response } from "express";

export const addToCart = asyncHandler(async (req: any, res: Response) => {
  const { _id } = req.user;
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: _id });

  if (!cart) {
    cart = await Cart.create({
      user: _id,
      products: [{ product: productId, quantity }],
    });
  } else {
    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
  }

  res.status(201).json({
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
});

export const getCartByUser = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;

    const cart = await Cart.findOne({ user: _id }).populate("products.product");

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart || { products: [] },
    });
  }
);

export const incrementCart = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { user: _id },
      { $addToSet: { products: productId, quantity } },
      { new: true }
    );

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product incremented successfully",
    });
  }
);

export const decrementCart = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { user: _id },
      { $addToSet: { products: productId, quantity: quantity } },
      { new: true }
    );

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product incremented successfully",
    });
  }
);

export const removeFromCart = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;

    const cart = await Cart.findOneAndUpdate(
      { user: _id },
      { $pull: { products: req.body.productId } },
      { new: true }
    );

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from the cart successfully",
    });
  }
);
