export type TDeliveryMethod = "standard" | "express" | "same-day";

export type TOrder = {
  addressId: string;
  deliveryMethod: TDeliveryMethod;
};
