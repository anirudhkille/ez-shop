import mongoose from "mongoose";

export interface IInvoiceProduct {
  name: string;
  quantity: number;
  /** Price charged per unit at the time of purchase. */
  price: number;
  variantId?: string;
  size?: string;
}

export interface IInvoice {
  invoiceNumber: string;
  order: mongoose.Types.ObjectId | string;
  user?: mongoose.Types.ObjectId | string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  /** Snapshotted so the invoice always matches the original sale. */
  address?: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };

  products: IInvoiceProduct[];

  subtotal: number;
  discount?: number;
  couponCode?: string;
  deliveryCharge?: number;
  totalAmount: number;

  paymentType?: string;
  paymentStatus?: string;
  orderStatus?: string;

  issuedAt: Date;
}

const invoiceSchema = new mongoose.Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: String,
    customerEmail: String,
    customerPhone: String,

    address: {
      name: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },

    products: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        variantId: String,
        size: String,
      },
    ],

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: String,
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentType: String,
    paymentStatus: String,
    orderStatus: String,

    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);
export default Invoice;
