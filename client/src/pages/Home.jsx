import { useEffect, useState } from "react";
import Products from "../components/Products";
import axios from "axios";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://fakestoreapi.com/products");
        setProducts(response.data);
      } catch (error) {
        console.error(`Error fetching products: ${error}`);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section>
      <Products products={products} />
    </section>
  );
};

export default Home;
