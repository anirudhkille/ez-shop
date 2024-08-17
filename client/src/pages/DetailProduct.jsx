import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/LinearProgress";
import Rating from "@mui/material/Rating";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";

const DetailProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const dispatch = useDispatch();
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
                <div className="flex mb-2">
                  <span className="flex items-center">
                    <Rating
                      name="half-rating-read"
                      defaultValue={product.rating.rate}
                      precision={0.5}
                      readOnly
                      style={{ color: "#4F46E5" }}
                    />

                    <span className="ml-3 text-gray-600">
                      {product.rating.rate} & {product.rating.count} Reviews
                    </span>
                  </span>
                </div>
                <p className="leading-relaxed">{product.description}</p>
                <div className="flex">
                  <span className="mt-2 text-2xl font-medium text-gray-900 title-font">
                    ₹ {(product.price * 10).toFixed(2)}
                  </span>
                </div>
                <button
                  className="flex px-6 py-2 mt-3 text-white bg-indigo-500 border-0 rounded focus:outline-none hover:bg-indigo-600 "
                  onClick={() => dispatch(addToCart(product))}
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
