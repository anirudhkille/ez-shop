import { useEffect, useState } from "react";
import Products from "../components/Products";
import { useParams } from "react-router-dom";


const CategoryProduct = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/category/${name}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.log(error));
  }, [name]);

  return (
    <section className="min-h-[100vh]">
      <Products products={products} />
    </section>
  );
};

export default CategoryProduct;
