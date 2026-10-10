import Order, { IOrder } from "@/modules/order/order.model";
import { FilterQuery, Types } from "mongoose";

export const create = async (data: Partial<IOrder>) => {
  return await Order.create(data);
};

const BUYER_FIELDS = "name email phone";

const withResolvedBuyer = <
  T extends {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  },
>(
  order: T,
) => {
  const buyer = (order as { user?: unknown }).user as
    | { name?: string; email?: string; phone?: string }
    | null
    | undefined;

  return {
    ...order,
    name: order.name ?? buyer?.name,
    email: order.email ?? buyer?.email,
    phone: order.phone ?? buyer?.phone,
  };
};

export const find = async (skip: number, limit: number) => {
  const orders = await Order.find()
    .populate("user", BUYER_FIELDS)
    .skip(skip)
    .limit(limit)
    .lean();

  return orders.map(withResolvedBuyer);
};

export const countDocuments = async (filter?: FilterQuery<IOrder>) => {
  return await Order.countDocuments(filter);
};

/**
 * Fields the account orders list renders. Deliberately excludes the
 * denormalised guest PII (`name`, `email`, `phone`, `address`) and the payment
 * internals (`paymentIntentId`, `sessionId`) — the list has no use for them and
 * they are only needed by the single-order and invoice reads.
 *
 * `products` must stay in the projection or the populate below has nothing to
 * attach to.
 */
const MY_ORDER_FIELDS =
  "_id createdAt orderStatus paymentStatus paymentType deliveryMethod " +
  "subtotal discount deliveryCharge totalAmount coupon products";

export const findByUser = async (
  userId: string,
  skip: number,
  limit: number,
) => {
  // Newest first. lean() skips hydration on this read-only listing.
  return await Order.find({ user: userId })
    .select(MY_ORDER_FIELDS)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("products.product", "name image price slug")
    .lean();
};

export const countByUser = async (userId: string) => {
  return await Order.countDocuments({ user: userId });
};

export const hasPurchased = async (
  userId: string,
  productId: string,
): Promise<boolean> => {
  const found = await Order.exists({
    user: userId,
    "products.product": productId,
    paymentStatus: "paid",
  });

  return found !== null;
};

export const countByUserAndCoupon = async (userId: string, code: string) => {
  return await Order.countDocuments({
    user: userId,
    "coupon.code": code,
  });
};

/** Lifetime value for a customer, used by the admin user detail view. */
export const statsByUser = async (userId: string) => {
  const [row] = await Order.aggregate<{
    orderCount: number;
    totalSpent: number;
    itemCount: number;
    lastOrderAt: Date | null;
  }>([
    { $match: { user: new Types.ObjectId(String(userId)) } },
    {
      $group: {
        _id: null,
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        itemCount: { $sum: { $sum: "$products.quantity" } },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
  ]);

  return {
    orderCount: row?.orderCount ?? 0,
    totalSpent: Math.round((row?.totalSpent ?? 0) * 100) / 100,
    itemCount: row?.itemCount ?? 0,
    lastOrderAt: row?.lastOrderAt ?? null,
  };
};

export const recentByUser = async (userId: string, limit = 10) => {
  return await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("products.product", "name image price slug");
};

export const findById = async (id: string) => {
  return await Order.findById(id);
};

export const findByIdLean = async (id: string) => {
  return await Order.findById(id).lean();
};

export const findByIdPopulated = async (
  id: string | Types.ObjectId,
  { includeBuyer = false }: { includeBuyer?: boolean } = {},
) => {
  const base = Order.findById(id).populate(
    "products.product",
    "name image price slug",
  );

  if (!includeBuyer) return await base;

  const order = await base.populate("user", BUYER_FIELDS).lean();

  return order ? withResolvedBuyer(order) : null;
};

export const findOnePopulated = async (filter: FilterQuery<IOrder>) => {
  return await Order.findOne(filter).populate(
    "products.product",
    "name image price slug",
  );
};

export const findByIdAndUpdate = async (
  id: string,
  updates: Partial<IOrder>,
) => {
  return await Order.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteById = async (id: string) => {
  return await Order.findByIdAndDelete(id);
};
