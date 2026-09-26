import mongoose from "mongoose";

import Invoice, { IInvoice } from "@/modules/invoice/invoice.model";

/** Sequential, human-readable reference, e.g. INV-2026-000042. */
export const nextInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const last = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${prefix}`),
  })
    .sort({ invoiceNumber: -1 })
    .select("invoiceNumber")
    .lean();

  const lastSeq = last
    ? Number.parseInt(last.invoiceNumber.slice(prefix.length), 10)
    : 0;

  const next = (Number.isNaN(lastSeq) ? 0 : lastSeq) + 1;

  return `${prefix}${String(next).padStart(6, "0")}`;
};

/** Returns a plain object so callers can spread it, like every read above. */
export const create = async (data: Partial<IInvoice>) => {
  const invoice = await Invoice.create(data);
  return invoice.toObject();
};

export const findByOrder = async (orderId: string) => {
  return await Invoice.findOne({ order: orderId }).lean();
};

export const findByNumber = async (invoiceNumber: string) => {
  return await Invoice.findOne({ invoiceNumber }).lean();
};

/**
 * Resolves an invoice for a user request. `userId` scopes the lookup so one
 * customer cannot read another's invoice by guessing an order id.
 */
export const findForUser = async (
  orderId: string,
  userId?: string | null,
): Promise<(IInvoice & { _id: unknown }) | null> => {
  const filter: Record<string, unknown> = { order: orderId };

  if (userId) {
    filter.user = userId;
  }

  return await Invoice.findOne(filter).lean();
};

export const existsForOrder = async (orderId: string) => {
  const invoice = await Invoice.findOne({ order: orderId })
    .select("_id")
    .lean();
  return invoice !== null;
};

export const isValidOrderId = (value: string) =>
  mongoose.Types.ObjectId.isValid(value);
