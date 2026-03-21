import { Response } from "express";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { asyncHandler } from "@/middlewares/asyncHandler";

const findVariantSize = (product: any, variantId?: string, size?: string) => {
  if (!variantId || !size) return null;

  const variant = product.variants.find(
    (v: any) => v._id.toString() === variantId
  );
  if (!variant) return null;

  return variant.sizes.find((s: any) => s.size === size) || null;
};

export const getCart = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product",
    "name image price discountPrice variants publish"
  );

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { products: [], total: 0, subtotal: 0, discountTotal: 0 },
    });
  }

  const validItems: any[] = [];
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of cart.products) {
    const prod = item.product as any;

    if (!prod.publish) continue;

    let price = item.priceAtPurchase || prod.price;
    let discountPrice = item.discountPriceAtPurchase || prod.discountPrice;

    subtotal += price * item.quantity;

    if (discountPrice) {
      discountTotal += (price - discountPrice) * item.quantity;
    }

    validItems.push(item);
  }

  cart.products.splice(0, cart.products.length, ...validItems);

  await cart.save();

  return res.status(200).json({
    success: true,
    data: {
      ...cart.toObject(),
      subtotal,
      discountTotal,
      total: subtotal - discountTotal,
    },
  });
});

export const addToCart = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user._id;
  const { productId, variantId, size, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });

  if (!product.publish)
    return res
      .status(400)
      .json({ success: false, message: "Product is not available" });

  let selectedPrice = product.price;
  let selectedDiscount = product.discountPrice;
  let sizeStock = product.stock;

  const sizeObj = findVariantSize(product, variantId, size);
  if (variantId && size) {
    if (!sizeObj)
      return res
        .status(400)
        .json({ success: false, message: "Invalid variant or size" });

    sizeStock = sizeObj.stock;
    selectedPrice = sizeObj.price || selectedPrice;
    selectedDiscount = sizeObj.discountPrice || selectedDiscount;
  }

  if (sizeStock <= 0)
    return res.status(400).json({ success: false, message: "Out of stock" });

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, products: [] });

  const existing = cart.products.find(
    (p) =>
      p.product.toString() === productId &&
      p.variantId?.toString() === variantId &&
      p.size === size
  );

  const addQty = quantity || 1;

  if (existing) {
    if (existing.quantity + addQty > sizeStock)
      return res
        .status(400)
        .json({ success: false, message: "Exceeds available stock" });

    existing.quantity += addQty;
  } else {
    cart.products.push({
      product: productId,
      variantId,
      size,
      quantity: addQty,
      priceAtPurchase: selectedPrice,
      discountPriceAtPurchase: selectedDiscount,
    });
  }

  await cart.save();

  return res.json({ success: true, message: "Added to cart", cart });
});

export const updateQuantity = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user._id;
  const { cartItemId, quantity } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product"
  );

  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });

  const item = cart.products.id(String(cartItemId));
  if (!item)
    return res.status(404).json({ success: false, message: "Item not found" });

  const product = item.product as any;

  const sizeObj = findVariantSize(
    product,
    item.variantId ? String(item.variantId) : undefined,
    item.size
  );
  const maxStock = sizeObj ? sizeObj.stock : product.stock;

  if (quantity > maxStock)
    return res
      .status(400)
      .json({ success: false, message: "Exceeds stock limit" });

  item.quantity = quantity;

  await cart.save();

  return res.json({ success: true, message: "Quantity updated", cart });
});

export const removeFromCart = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user._id;
  const { cartItemId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });

  const filtered = cart.products.filter(
    (p: any) => String(p._id) !== String(cartItemId)
  );

  cart.products.splice(0, cart.products.length, ...filtered);

  await cart.save();

  return res.json({ success: true, message: "Item removed", data: cart });
});

export const clearCart = asyncHandler(async (req: any, res: Response) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { products: [] });

  res.status(200).json({ success: true, message: "Cart cleared" });
});
