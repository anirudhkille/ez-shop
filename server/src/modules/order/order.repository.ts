import Order, { IOrder } from "@/modules/order/order.model";
import { FilterQuery, Types } from "mongoose";

export const create = async (data: Partial<IOrder>) => {
  return await Order.create(data);
};

export const find = async (skip: number, limit: number) => {
  return await Order.find().skip(skip).limit(limit);
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
  // Newest first, and the product ref must be populated so the client can
  // render line-item names and thumbnails without a second round trip.
  // lean() skips hydration since this is a read-only listing.
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

export const findByIdPopulated = async (id: string) => {
  return await Order.findById(id).populate(
    "products.product",
    "name image price slug",
  );
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
