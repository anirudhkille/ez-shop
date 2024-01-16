import Home from "./pages/Home";
import "./index.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import DetailProduct from "./pages/DetailProduct";
import CategoryProduct from "./pages/CategoryProduct";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSummary from "./pages/OrderSummary";

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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-summary" element={<OrderSummary />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
