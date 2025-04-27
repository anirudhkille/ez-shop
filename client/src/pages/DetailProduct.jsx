import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useCartStore from "../store/cartStore";
import Button from "../components/ui/Button";

const DetailProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const { addToCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => res.json())
      .then((result) => {
        setProduct([result]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <section className="text-gray-600 body-font overflow-hidden min-h-[100vh] flex ">
      {product.length === 0 ? (
        <div className="text-primary text-2xl flex justify-center items-center mx-auto min:h-[100vh]">
          Product not found
        </div>
      ) : (
        <div className="container px-5 py-6 mx-auto">
          {product?.map((product) => (
            <div className="flex flex-wrap mx-auto lg:w-4/5" key={product.id}>
              <img
                alt={product.title}
                className="lg:w-1/2 w-full lg:h-auto h-54 object-contain max-h-[400px] object-center max-sm:w-1/2 m-auto"
                src={product.image}
              />
              <div className="w-full mt-6 lg:w-1/2 lg:pl-10 lg:py-6 lg:mt-0">
                <h2 className="text-sm tracking-widest text-gray-500 title-font">
                  {product.category}
                </h2>
                <h1 className="mb-2 text-3xl font-medium text-gray-900 title-font ">
                  {product.title}
                </h1>

                <p className="leading-relaxed">{product.description}</p>
                <div className="flex">
                  <span className="mt-2 text-2xl font-medium text-gray-900 title-font">
                    ₹ {(product.price * 10).toFixed(2)}
                  </span>
                </div>
                <Button
                  className="mt-3"
                  size="lg"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DetailProduct;
