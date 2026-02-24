export type TAddress = {
  _id?: string;
  label: "Home" | "Work" | "Other";
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  state: string;
  city: string;
  country: string;
  isDefault: boolean;
};
