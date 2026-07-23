import Product from "@/modules/product/product.model";
import * as cartRepository from "@/modules/cart/cart.repository";

const findVariantSize = (product: any, variantId?: string, size?: string) => {
  if (!variantId || !size) return null;

  const variant = product.variants.find(
    (v: any) => v._id.toString() === variantId,
  );
  if (!variant) return null;

  return variant.sizes.find((s: any) => s.size === size) || null;
};

export const getCart = async (userId: string) => {
  const cart = await cartRepository.findOnePopulated({ user: userId });

  if (!cart) {
    return {
      data: { products: [], total: 0, subtotal: 0, discountTotal: 0 },
      status: 200,
    };
  }

  const validItems: any[] = [];
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of cart.products) {
    const prod = item.product as any;

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
    data: {
      ...cart.toObject(),
      products: validItems,
      subtotal,
      discountTotal,
      total: subtotal - discountTotal,
    },
  };
};

export const addToCart = async (userId: string, body: any) => {
  const { productId, variantId, size, quantity } = body;

  const product = await Product.findById(productId);
  if (!product) {
    return { status: 404, data: { success: false, message: "Product not found" } };
  }

  if (!product.publish) {
    return { status: 400, data: { success: false, message: "Product not available" } };
  }

  let selectedPrice = product.price;
  let selectedDiscount = product.discountPrice;
  let sizeStock = product.stock;

  const sizeObj = findVariantSize(product, variantId, size);

  if (variantId && size) {
    if (!sizeObj) {
      return { status: 400, data: { success: false, message: "Invalid variant/size" } };
    }

    sizeStock = sizeObj.stock;
    selectedPrice = sizeObj.price ?? selectedPrice;
    selectedDiscount = sizeObj.discountPrice ?? selectedDiscount;
  }

  if (sizeStock <= 0) {
    return { status: 400, data: { success: false, message: "Out of stock" } };
  }

  let cart = await cartRepository.findOne({ user: userId });
  if (!cart) cart = await cartRepository.create({ user: userId, products: [] });

  const existing = cart.products.find(
    (p: any) =>
      p.product.toString() === productId &&
      p.variantId?.toString() === variantId &&
      p.size === size,
  );

  const addQty = quantity || 1;

  if (existing) {
    if (existing.quantity + addQty > sizeStock) {
      return { status: 400, data: { success: false, message: "Exceeds stock" } };
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

  return { data: { success: true, message: "Added to cart", data: cart } };
};

export const updateQuantity = async (userId: string, cartItemId: string, quantity: number) => {
  const cart = await cartRepository.findOneWithProductPopulated({ user: userId });

  if (!cart) {
    return { status: 404, data: { success: false, message: "Cart not found" } };
  }

  const item = cart.products.id(String(cartItemId));
  if (!item) {
    return { status: 404, data: { success: false, message: "Item not found" } };
  }

  const product = item.product as any;

  const sizeObj = findVariantSize(
    product,
    item.variantId ? String(item.variantId) : undefined,
    item.size,
  );

  const maxStock = sizeObj ? sizeObj.stock : product.stock;

  if (quantity > maxStock) {
    return { status: 400, data: { success: false, message: "Exceeds stock limit" } };
  }

  item.quantity = quantity;

  await cart.save();

  return { data: { success: true, message: "Quantity updated", data: cart } };
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
  const cart = await cartRepository.findOne({ user: userId });

  if (!cart) {
    return { status: 404, data: { success: false, message: "Cart not found" } };
  }

  cart.products.pull(cartItemId);

  await cart.save();

  return { data: { success: true, message: "Item removed", data: cart } };
};

export const clearCart = async (userId: string) => {
  await cartRepository.findOneAndUpdate({ user: userId }, { products: [] });
  return { data: { success: true, message: "Cart cleared" } };
};

export const getCartItemCount = async (userId: string) => {
  const cart = await cartRepository.findOne({ user: userId });

  const count = cart?.products.length || 0;

  return { data: { success: true, data: { count } } };
};
