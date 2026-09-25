export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: IPagination;
}

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface IVariantSize {
  size: string;
  stock: number;
  sku?: string;
  price?: number;
  discountPrice?: number;
}

export interface IVariant {
  color: string;
  colorCode?: string;
  images: string[];
  sizes: IVariantSize[];
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string | { _id: string; name: string };
  price: number;
  discountPrice?: number;
  image: string;
  variants?: IVariant[];
  gender: "men" | "women" | "unisex";
  stock: number;
  isFeatured: boolean;
  isBestSellers: boolean;
  rating?: number;
  reviewsCount?: number;
  tag: "Best Seller" | "Trending" | "Limited" | "New" | "Hot" | "Sale";
  publish: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderProduct {
  product: string | { _id: string; name: string; image?: string };
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  user?: string;
  name: string;
  email: string;
  phone?: string;
  products: IOrderProduct[];
  address: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  subtotal: number;
  deliveryCharge: number;
  discount?: number;
  coupon?: { code: string; type: string; discount: number };
  totalAmount: number;
  paymentStatus: string;
  paymentType: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export type ICouponType = "percentage" | "fixed";

export interface ICoupon {
  _id: string;
  code: string;
  type: ICouponType;
  value: number;
  description?: string;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser?: number;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserStats {
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  itemCount: number;
  lastOrderAt: string | null;
  wishlistCount: number;
  addressCount: number;
}

export interface IUserWishlistItem {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  price: number;
  discountPrice?: number;
  publish?: boolean;
  stock?: number;
}

export interface IUserAddress {
  _id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IUserAdminDetail {
  user: IUser;
  stats: IUserStats;
  orders: IOrder[];
  wishlist: IUserWishlistItem[];
  addresses: IUserAddress[];
}
export interface INewsletterSubscriber {
  _id: string;
  email: string;
  /** Undefined for records that predate the timestamps option. */
  createdAt?: string;
  updatedAt?: string;
}
