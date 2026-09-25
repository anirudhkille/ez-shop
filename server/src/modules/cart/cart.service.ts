import Product from "@/modules/product/product.model";
import { AppError } from "@/utils/appError";
import * as cartRepository from "@/modules/cart/cart.repository";

type VariantSize = {
  size?: string;
  stock: number;
  price?: number;
  discountPrice?: number;
};

type ProductLike = {
  stock: number;
  variants: { _id: unknown; sizes: VariantSize[] }[];
};

const findVariantSize = (
  product: ProductLike,
  variantId?: string,
  size?: string,
) => {
  if (!variantId || !size) return null;

  const variant = product.variants.find((v) => String(v._id) === variantId);
  if (!variant) return null;

  return variant.sizes.find((s) => s.size === size) || null;
};

export const getCart = async (userId: string) => {
  const cart = await cartRepository.findOnePopulated({ user: userId });

  if (!cart) {
    return { products: [], total: 0, subtotal: 0, discountTotal: 0 };
  }

  const validItems: (typeof cart.products)[number][] = [];
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of cart.products) {
    const prod = item.product as unknown as {
      publish?: boolean;
      price: number;
      discountPrice: number;
    };

    if (!prod || !prod.publish) continue;

    const price = item.priceAtPurchase ?? prod.price;
    const discountPrice = item.discountPriceAtPurchase ?? prod.discountPrice;

    subtotal += price * item.quantity;

    if (discountPrice) {
      discountTotal += (price - discountPrice) * item.quantity;
    }

    validItems.push(item);
  }

  return {
    ...cart.toObject(),
    products: validItems,
    subtotal,
    discountTotal,
    total: subtotal - discountTotal,
  };
};

export const addToCart = async (
  userId: string,
  body: {
    productId: string;
    variantId?: string;
    size?: string;
    quantity?: number;
  },
) => {
  const { productId, variantId, size, quantity } = body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (!product.publish) {
    throw new AppError("Product not available", 400);
  }

  let selectedPrice = product.price;
  let selectedDiscount = product.discountPrice;
  let sizeStock = product.stock;

  const sizeObj = findVariantSize(product, variantId, size);

  if (variantId && size) {
    if (!sizeObj) {
      throw new AppError("Invalid variant/size", 400);
    }

    sizeStock = sizeObj.stock;
    selectedPrice = sizeObj.price ?? selectedPrice;
    selectedDiscount = sizeObj.discountPrice ?? selectedDiscount;
  }

  if (sizeStock <= 0) {
    throw new AppError("Out of stock", 400);
  }

  let cart = await cartRepository.findOne({ user: userId });
  if (!cart) cart = await cartRepository.create({ user: userId, products: [] });

  const existing = cart.products.find(
    (p) =>
      p.product.toString() === productId &&
      p.variantId?.toString() === variantId &&
      p.size === size,
  );

  const addQty = quantity || 1;

  if (existing) {
    if (existing.quantity + addQty > sizeStock) {
      throw new AppError("Exceeds stock", 400);
    }

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

  return cart;
};

export const updateQuantity = async (
  userId: string,
  cartItemId: string,
  quantity: number,
) => {
  const cart = await cartRepository.findOneWithProductPopulated({
    user: userId,
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const item = cart.products.id(String(cartItemId));
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  const product = item.product as unknown as ProductLike;

  const sizeObj = findVariantSize(
    product,
    item.variantId ? String(item.variantId) : undefined,
    item.size,
  );

  const maxStock = sizeObj ? sizeObj.stock : product.stock;

  if (quantity > maxStock) {
    throw new AppError("Exceeds stock limit", 400);
  }

  item.quantity = quantity;

  await cart.save();

  return cart;
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
  const cart = await cartRepository.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  cart.products.pull(cartItemId);

  await cart.save();

  return cart;
};

export const clearCart = async (userId: string) => {
  await cartRepository.findOneAndUpdate({ user: userId }, { products: [] });
  return { cleared: true };
};

export const getCartItemCount = async (userId: string) => {
  const cart = await cartRepository.findOne({ user: userId });

  const count = cart?.products.length || 0;

  return { count };
};
