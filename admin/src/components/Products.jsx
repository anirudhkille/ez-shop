import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/reducer/cartReducer";

const Products = ({ products }) => {
  const dispatch = useDispatch();

  return (
    <div className="text-gray-400 body-font min-h-[100vh]">
      <div className="container px-5 mx-auto py-14 ">
        <div className="flex flex-wrap -m-4 ">
          {products?.map((product) => (
            <div
              className="w-full p-4 mt-5 lg:w-1/4 md:w-1/2 "
              key={product.id}
            >
              <Link to={`/products/${product.id}`}>
                <div className="relative block h-48 overflow-hidden rounded -z-10">
                  <img
                    alt="ecommerce"
                    className="block object-cover object-center w-full h-full "
                    src={product.image}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className="mt-4">
                  <h3 className="mb-1 text-xs tracking-widest text-gray-500 title-font">
                    {product.category}
                  </h3>
                  <h2 className="text-lg font-medium text-black title-font ">
                    {product.title}
                  </h2>
                  <div className="flex items-center justify-between mt-1">
                    <p>₹ {(product.price * 10).toFixed(2)}</p>
                    <span className="text-white bg-[#388E3C] rounded px-1  flex items-center text-sm gap-1 justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {product.rating.rate}
                    </span>
                  </div>
                </div>
              </Link>
              <button
                className="flex px-6 py-2 mx-auto mt-5 text-white bg-indigo-500 border-0 rounded focus:outline-none hover:bg-indigo-600"
                onClick={() => dispatch(addToCart(product))}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
