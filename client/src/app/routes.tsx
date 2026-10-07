import { lazy } from "react";

import { Route, Routes } from "react-router";

import { ProtectedRoute, RedirectIfAuthenticated } from "@/features/auth";

import { Layout } from "./layout";
import { NotFound } from "./not-found";

const Home = lazy(() => import("@/features/home/pages/home"));
const Products = lazy(() => import("@/features/product/pages/products"));
const DetailProduct = lazy(
  () => import("@/features/product/pages/detail-product")
);
const Cart = lazy(() => import("@/features/cart/pages/cart"));
const Checkout = lazy(() => import("@/features/checkout/pages/checkout"));

const Login = lazy(() => import("@/features/auth/pages/login"));
const Signup = lazy(() => import("@/features/auth/pages/signup"));
const VerifyEmail = lazy(() => import("@/features/auth/pages/verify-email"));
const ForgotPassword = lazy(
  () => import("@/features/auth/pages/forgot-password")
);
const ResetPassword = lazy(
  () => import("@/features/auth/pages/reset-password")
);
const UpdatePassword = lazy(
  () => import("@/features/auth/pages/update-password")
);
const GoogleCallback = lazy(
  () => import("@/features/auth/pages/google-callback")
);

const Successful = lazy(() => import("@/features/payment/pages/successful"));
const Failure = lazy(() => import("@/features/payment/pages/failure"));

const Profile = lazy(() => import("@/features/account/pages/profile"));
const OverviewPanel = lazy(
  () => import("@/features/account/pages/overview-panel")
);
const SavedPanel = lazy(() => import("@/features/account/pages/saved-panel"));
const SettingsPanel = lazy(
  () => import("@/features/account/pages/settings-panel")
);
const DeliveryAddresses = lazy(
  () => import("@/features/account/pages/delivery-addresses")
);

const OrdersPanel = lazy(() => import("@/features/order/pages/orders-panel"));
const OrderDetail = lazy(() => import("@/features/order/pages/order-detail"));
const TrackOrder = lazy(() => import("@/features/order/pages/track-order"));
const Returns = lazy(() => import("@/features/policies/pages/returns"));
const ShippingInfo = lazy(
  () => import("@/features/policies/pages/shipping-info")
);

const CookiePolicy = lazy(
  () => import("@/features/policies/pages/cookie-policy")
);
const TermsOfUse = lazy(() => import("@/features/policies/pages/terms"));
const PrivacyPolicy = lazy(() => import("@/features/policies/pages/privacy"));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/:slug/:id" element={<DetailProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Profile />}>
            <Route index element={<OverviewPanel />} />
            <Route path="orders" element={<OrdersPanel />} />
            <Route path="saved" element={<SavedPanel />} />
            <Route path="settings" element={<SettingsPanel />} />
          </Route>
          <Route path="/account/orders/:orderId" element={<OrderDetail />} />
          <Route path="/account/addresses" element={<DeliveryAddresses />} />
          <Route path="/account/password" element={<UpdatePassword />} />
        </Route>
        <Route path="/success" element={<Successful />} />
        <Route path="/failure" element={<Failure />} />

        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/shipping-info" element={<ShippingInfo />} />

        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
