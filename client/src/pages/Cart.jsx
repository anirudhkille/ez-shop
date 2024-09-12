import { Link, useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
  clearFromCart,
  cartTotal,
} from "../redux/reducer/cartReducer";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const total = useSelector((state) => cartTotal(state));
  const cartItems = useSelector((state) => state.cart.cartItems);
  const userId = useSelector((state) => state.user.userId);

  return (
    <div className="w-3/4 pt-10 m-auto max-md:w-full">
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 mt-10">
          <h2 className="text-2xl font-medium text-center text-gray-900">
            Your Cart Is Empty!
          </h2>
          <ShoppingCartIcon
            style={{ height: "150px", width: "150px", color: "GrayText" }}
          />
          <button
            onClick={() => navigate("/")}
            className="px-5 py-3 text-white bg-indigo-500 border rounded"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 px-4 py-6 sm:px-6">
            <h2 className="text-lg font-medium text-center text-gray-900">
              Shopping cart
            </h2>

            <div className="mt-8">
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                {cartItems.map((cart) => (
                  <li className="flex py-6 max-sm:block" key={cart.id}>
                    <div className="flex-shrink-0 w-24 h-24 ml-4 overflow-hidden border border-gray-200 rounded-md max-sm:h-14 max-sm:w-14">
                      <img
                        src={cart.image}
                        alt={cart.title}
                        className="object-contain object-center w-full h-full"
                      />
                    </div>

                    <div className="flex flex-col flex-1 ml-4 ">
                      <div className="">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="">
                            <p>{cart.title}</p>
                          </h3>
                          <p className="ml-4 tracking-wider">
                            ₹{(cart.price * cart.quantity).toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-1 mb-2 text-sm text-gray-500">
                          {cart.category}
                        </p>
                      </div>
                      <div className="flex items-end justify-between flex-1 text-sm">
                        <p className="text-gray-500">
                          <button
                            onClick={() =>
                              dispatch(removeFromCart({ id: cart.id }))
                            }
                            className="px-2 mr-2 font-bold text-center text-white bg-indigo-600"
                          >
                            -
                          </button>
                          {cart.quantity}
                          <button
                            onClick={() => dispatch(addToCart({ id: cart.id }))}
                            className="px-2 ml-1 font-bold text-center text-white bg-indigo-600"
                          >
                            +
                          </button>
                        </p>

                        <div className="flex">
                          <button
                            onClick={() =>
                              dispatch(clearFromCart({ id: cart.id }))
                            }
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="px-4 py-6 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p className="tracking-wider">₹ {total.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6">
              {userId ? (
                <Link
                  to="/checkout"
                  className="flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                >
                  Checkout
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                >
                  Login to Checkout
                </Link>
              )}
            </div>
            <div className="flex justify-center mt-6 text-sm text-center text-gray-500">
              <p>
                or{" "}
                <button
                  onClick={() => navigate(-1)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
