import { AppError } from "@/utils/appError";
import * as orderRepository from "@/modules/order/order.repository";
import * as invoiceRepository from "@/modules/invoice/invoice.repository";
import * as productRepository from "@/modules/product/product.repository";
import type { IInvoiceProduct } from "@/modules/invoice/invoice.model";

/** Loose shape so a mongoose Order document satisfies it structurally. */
type OrderLike = {
  _id: unknown;
  user?: unknown;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  products?: {
    product: unknown;
    quantity: number;
    price: number;
    variantId?: string;
    size?: string;
  }[];
  address?: Record<string, unknown> | null;
  subtotal?: number | null;
  discount?: number | null;
  deliveryCharge?: number | null;
  totalAmount?: number | null;
  paymentType?: string | null;
  paymentStatus?: string | null;
  orderStatus?: string | null;
  coupon?: { code?: string | null } | string | null;
};

const OBJECT_ID = /^[a-f\d]{24}$/i;

const nameFor = (product: unknown): string => {
  if (typeof product === "object" && product !== null) {
    const candidate = product as { name?: unknown; _id?: unknown };

    if (typeof candidate.name === "string" && candidate.name) {
      return candidate.name;
    }

    if (candidate._id) return String(candidate._id);
  }

  return String(product ?? "Product");
};

/**
 * Snapshots an order into a stored invoice. The order's line items only carry
 * product ids, so names are resolved once here and then frozen onto the
 * invoice — a later product rename or price change must not alter the record
 * of what was actually sold.
 */
export const issueInvoiceForOrder = async (order: OrderLike) => {
  const orderId = String(order._id);

  const existing = await invoiceRepository.findByOrder(orderId);

  if (existing) return existing;

  const products: IInvoiceProduct[] = (order.products ?? []).map((item) => ({
    name: nameFor(item.product),
    quantity: item.quantity,
    price: item.price,
    ...(item.variantId ? { variantId: String(item.variantId) } : {}),
    ...(item.size ? { size: item.size } : {}),
  }));

  const couponCode =
    typeof order.coupon === "string" ? order.coupon : order.coupon?.code;

  // Signed-in orders only denormalise the address, not name/phone at the top
  // level, so fall back to it rather than printing a blank bill-to.
  const snapshotAddress = order.address as
    | { name?: string; phone?: string }
    | null
    | undefined;

  return await invoiceRepository.create({
    invoiceNumber: await invoiceRepository.nextInvoiceNumber(),
    order: orderId,
    user: order.user ? String(order.user) : null,
    customerName: order.name ?? snapshotAddress?.name,
    customerEmail: order.email ?? undefined,
    customerPhone: order.phone ?? snapshotAddress?.phone,
    address: order.address as never,
    products,
    subtotal: order.subtotal ?? 0,
    discount: order.discount ?? 0,
    ...(couponCode ? { couponCode } : {}),
    deliveryCharge: order.deliveryCharge ?? 0,
    totalAmount: order.totalAmount ?? 0,
    paymentType: order.paymentType ?? undefined,
    paymentStatus: order.paymentStatus ?? undefined,
    orderStatus: order.orderStatus ?? undefined,
    issuedAt: new Date(),
  });
};

/**
 * Older invoices stored a bare product id as the line-item name. Resolve those
 * against the catalogue so an old invoice still prints a real product name.
 */
const resolveProductNames = async (products: IInvoiceProduct[]) => {
  const ids = products
    .map((item) => item.name)
    .filter((value) => OBJECT_ID.test(value));

  if (ids.length === 0) return products;

  const found = await productRepository.findByIds(ids);
  const names = new Map(
    found.map((product) => [String(product._id), product.name]),
  );

  return products.map((item) => {
    const resolved = names.get(item.name);
    return resolved ? { ...item, name: resolved } : item;
  });
};

/** An invoice carries customer PII, so the order owner must be proven first. */
const loadOwnedOrder = async (orderId: string, userId: string) => {
  const order = await orderRepository.findByIdLean(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (String(order.user ?? "") !== userId) {
    throw new AppError("Access denied", 403);
  }

  return order as unknown as OrderLike;
};

export const getInvoiceForOrder = async (
  orderId: string,
  userId?: string | null,
) => {
  if (!invoiceRepository.isValidOrderId(orderId)) {
    throw new AppError("Invalid order", 400);
  }

  // findForUser drops its user filter when userId is falsy, which would read
  // any order's invoice. Fail closed instead.
  if (!userId) {
    throw new AppError("Not authorized", 401);
  }

  const existing = await invoiceRepository.findForUser(orderId, userId);

  // Orders predating invoicing have no stored invoice; issue one on demand.
  // issueInvoiceForOrder is idempotent, so repeat clicks are safe.
  const invoice =
    existing ??
    (await issueInvoiceForOrder(await loadOwnedOrder(orderId, userId)));

  return {
    ...invoice,
    products: await resolveProductNames(invoice.products ?? []),
  };
};

export const getInvoiceByNumber = async (invoiceNumber: string) => {
  const invoice = await invoiceRepository.findByNumber(invoiceNumber);

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  return {
    ...invoice,
    products: await resolveProductNames(invoice.products ?? []),
  };
};
