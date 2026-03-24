import { lazy, Suspense } from "react";

import { Route, Routes } from "react-router";

const Layout = lazy(() => import("./layout/layout"));
const RedirectIfAuthenticated = lazy(
  () => import("./layout/redirect-if-authenticated")
);

const Home = lazy(() => import("./pages/home"));
const Products = lazy(() => import("./pages/products"));
const DetailProduct = lazy(() => import("./pages/detail-product"));
const Cart = lazy(() => import("./pages/cart"));
const Checkout = lazy(() => import("./pages/checkout"));

const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/signup"));
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));

const Wishlist = lazy(() => import("./pages/wishlist"));

const AccountLayout = lazy(() => import("./layout/account-layout"));
const AccountDetails = lazy(() => import("./pages/account/account-details"));
const DeliveryAddresses = lazy(
  () => import("./pages/account/delivery-addresses")
);
const UpdatePassword = lazy(() => import("./pages/account/update-password"));

const Successful = lazy(() => import("./pages/payment/successful"));
const Failure = lazy(() => import("./pages/payment/failure"));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Routes>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/:slug/:id" element={<DetailProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/success" element={<Successful />} />
          <Route path="/failure" element={<Failure />} />

          <Route element={<AccountLayout />}>
            <Route
              index
              path="/account/account-details"
              element={<AccountDetails />}
            />
            <Route
              path="/account/delivery-addresses"
              element={<DeliveryAddresses />}
            />
            <Route
              path="/account/update-password"
              element={<UpdatePassword />}
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
