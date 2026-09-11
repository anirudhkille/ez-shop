import { lazy, Suspense } from "react";

import { Route, Routes } from "react-router";

import ErrorBoundary from "./components/shared/error-boundary";
import { ScrollToTop } from "./components/shared/scroll-to-top";

const Layout = lazy(() => import("./layout/layout"));
const RedirectIfAuthenticated = lazy(
  () => import("./layout/redirect-if-authenticated")
);
const ProtectedRoute = lazy(() => import("./layout/protected-route"));

const Home = lazy(() => import("./pages/home"));
const Products = lazy(() => import("./pages/products"));
const DetailProduct = lazy(() => import("./pages/detail-product"));
const Cart = lazy(() => import("./pages/cart"));
const Checkout = lazy(() => import("./pages/checkout"));

const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/signup"));
const VerifyEmail = lazy(() => import("./pages/auth/verify-email"));
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const GoogleCallback = lazy(() => import("./pages/auth/google-callback"));

const Wishlist = lazy(() => import("./pages/wishlist"));

const Successful = lazy(() => import("./pages/payment/successful"));
const Failure = lazy(() => import("./pages/payment/failure"));

const NotFound = lazy(() => import("./pages/not-found"));
const Profile = lazy(() => import("./pages/profile/profile"));
const DeliveryAddresses = lazy(
  () => import("./pages/account/delivery-addresses")
);
const UpdatePassword = lazy(() => import("./pages/account/update-password"));
const TrackOrder = lazy(() => import("./pages/orders/track-order"));
const Returns = lazy(() => import("./pages/orders/returns"));
const ShippingInfo = lazy(() => import("./pages/orders/shipping-info"));
const CookiePolicy = lazy(() => import("./pages/legal/cookie-policy"));
const TermsOfUse = lazy(() => import("./pages/legal/terms"));
const PrivacyPolicy = lazy(() => import("./pages/legal/privacy"));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen" />}>
        <ScrollToTop />
        <Routes>
          <Route path="/auth/google-callback" element={<GoogleCallback />} />
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
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route
                path="/account/delivery-addresses"
                element={<DeliveryAddresses />}
              />
              <Route
                path="/account/update-password"
                element={<UpdatePassword />}
              />
            </Route>
            <Route path="/success" element={<Successful />} />
            <Route path="/failure" element={<Failure />} />

            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/shipping-info" element={<ShippingInfo />} />

            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
