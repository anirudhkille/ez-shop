export type TDeliveryMethod = "standard" | "express" | "one-day";

export type TOrder = {
  addressId: string;
  deliveryMethod: TDeliveryMethod;
};
