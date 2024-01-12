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
const App = () => {
  return (
    <>
      <Header />
      <main className="min-h-[100dvh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/products/:id" element={<DetailProduct />} />
          <Route path="products/category/:name" element={<CategoryProduct />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
