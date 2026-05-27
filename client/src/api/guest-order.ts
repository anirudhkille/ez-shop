import axiosInstance from "@/lib/axiosInstance";

export type TGuestAddress = {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
};

export type TGuestOrderPayload = {
  products: Array<{
    productId: string;
    quantity: number;
    size?: string;
    variantId?: string;
  }>;
  address: TGuestAddress;
  deliveryMethod: string;
  name: string;
  email: string;
  phone: string;
};

export const placeGuestCODOrder = async (payload: TGuestOrderPayload) => {
  const res = await axiosInstance.post("/order/guest", payload);
  return res.data;
};

export const createGuestCheckoutSession = async (payload: TGuestOrderPayload) => {
  const res = await axiosInstance.post("/payment/create-guest-session", payload);
  return res.data;
};
