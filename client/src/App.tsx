import { Route, Routes } from "react-router";
import { lazy, Suspense } from "react";

const Layout = lazy(() => import("./layout/layout"));
const RedirectIfAuthenticated = lazy(
  () => import("./layout/redirect-if-authenticated")
);
const NotFound = lazy(() => import("./pages/not-found"));

const Home = lazy(() => import("./pages/home"));
const CategoryProduct = lazy(() => import("./pages/category-product"));
const DetailProduct = lazy(() => import("./pages/detail-product"));
const Cart = lazy(() => import("./pages/cart"));
const Checkout = lazy(() => import("./pages/checkout"));
const Payment = lazy(() => import("./pages/payment"));
const OrderSummary = lazy(() => import("./pages/order-summary"));

const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/signup"));
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));

const AccountLayout = lazy(() => import("./layout/account-layout"));
const AccountDetails = lazy(() => import("./pages/account/account-details"));
const DeliveryAddresses = lazy(
  () => import("./pages/account/delivery-addresses")
);
const UpdatePassword = lazy(() => import("./pages/account/update-password"));

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
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<DetailProduct />} />
          <Route
            path="/products/category/:name"
            element={<CategoryProduct />}
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-summary" element={<OrderSummary />} />

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
