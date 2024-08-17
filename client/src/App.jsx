import "./index.css";
import { Header, Footer, ProtectedRoute } from "./components/index";
import { Route, Routes } from "react-router-dom";
import {
  Cart,
  CategoryProduct,
  Checkout,
  DetailProduct,
  Home,
  Login,
  OrderSummary,
  Payment,
  SignUp,
} from "./pages/index";

const App = () => {
  return (
    <>
      <Header />
      <main className="min-h-[100dvh] pt-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/products/:id" element={<DetailProduct />} />
          <Route path="products/category/:name" element={<CategoryProduct />} />
          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-summary"
            element={
              <ProtectedRoute>
                <OrderSummary />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
