export type TDeliveryMethod = "standard" | "express" | "same-day";

export type TOrder = {
  addressId: string;
  deliveryMethod: TDeliveryMethod;
  couponCode?: string;
};

export type TOrderProduct = {
  product:
    | string
    | {
        _id: string;
        name: string;
        image?: string;
        slug?: string;
      };
  quantity: number;
  price: number;
  size?: string;
};

export type TOrderSummary = {
  _id: string;
  createdAt: string;
  orderStatus: string;
  paymentStatus?: string;
  paymentType?: string;
  deliveryMethod?: string;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  totalAmount: number;
  products?: TOrderProduct[];
  coupon?: { code: string; type: string; discount: number };
};
