import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCartContext } from "../context/cartContext";
import CircularProgress from "@mui/material/LinearProgress";
import Rating from "@mui/material/Rating";

const DetailProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const { addToCart } = useCartContext();
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
      {loading ? (
        <div className="text-black text-2xl flex justify-center items-center mx-auto min:h-[100vh]">
          <CircularProgress style={{ color: "#4F46E5" }} />
        </div>
      ) : product.length === 0 ? (
        <div className="text-black text-2xl flex justify-center items-center mx-auto min:h-[100vh]">
          Product not found
        </div>
      ) : (
        <div className="container px-5 py-6 mx-auto mt-12">
          {product?.map((product) => (
            <div className="lg:w-4/5 mx-auto flex flex-wrap" key={product.id}>
              <img
                alt={product.title}
                className="lg:w-1/2 w-full lg:h-auto h-54 object-contain max-h-[400px] object-center max-sm:w-1/2 m-auto"
                src={product.image}
              />
              <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                <h2 className="text-sm title-font text-gray-500 tracking-widest">
                  {product.category}
                </h2>
                <h1 className="text-gray-900 text-3xl title-font font-medium mb-2 ">
                  {product.title}
                </h1>
                <div className="flex mb-2">
                  <span className="flex items-center">
                    <Rating
                      name="half-rating-read"
                      defaultValue={product.rating.rate}
                      precision={0.5}
                      readOnly
                      style={{ color: "#4F46E5" }}
                    />

                    <span className="text-gray-600 ml-3">
                      {product.rating.rate} & {product.rating.count} Reviews
                    </span>
                  </span>
                </div>
                <p className="leading-relaxed">{product.description}</p>
                <div className="flex">
                  <span className="title-font font-medium text-2xl text-gray-900 mt-2">
                    ₹ {(product.price * 10).toFixed(2)}
                  </span>
                </div>
                <button
                  className="flex mt-3 text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600   rounded "
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DetailProduct;
