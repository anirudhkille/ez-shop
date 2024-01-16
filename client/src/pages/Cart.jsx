import { Link, useNavigate } from "react-router-dom";
import { useCartContext } from "../context/cartContext";
import { useUserContext } from "../context/userContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Cart = () => {
  const navigation = useNavigate();
  const { cartItems, addToCart, removeFromCart, clearCart, getCartTotal } =
    useCartContext();
  const { userId } = useUserContext();

  return (
    <div className="w-3/4 m-auto max-md:w-full pt-10">
      {cartItems.length === 0 ? (
        <div className="flex items-center justify-center flex-col mt-10 gap-5">
          <h2 className="text-2xl font-medium text-gray-900 text-center">
            Your Cart Is Empty!
          </h2>
          <ShoppingCartIcon
            style={{ height: "150px", width: "150px", color: "GrayText" }}
          />
          <button
            onClick={() => navigation("/")}
            className="border bg-indigo-500 text-white rounded px-5 py-3"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1  px-4 py-6 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 text-center">
              Shopping cart
            </h2>

            <div className="mt-8">
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                {cartItems?.map((cart) => (
                  <li className="flex py-6 max-sm:block" key={cart.id}>
                    <div
                      className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 
               max-sm:h-14 max-sm:w-14 ml-4"
                    >
                      <img
                        src={cart.image}
                        alt={cart.title}
                        className="h-full w-full object-contain object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col ">
                      <div className="">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="">
                            <p>{cart.title}</p>
                          </h3>
                          <p className="ml-4 tracking-wider">
                            ₹{(cart.price * 10).toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 mb-2">
                          {cart.category}
                        </p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">
                          <button
                            onClick={() => removeFromCart(cart)}
                            className="font-bold  bg-indigo-600 px-2 text-white text-center mr-2"
                          >
                            -
                          </button>
                          {cart.quantity}
                          <button
                            onClick={() => addToCart(cart)}
                            className="font-bold  bg-indigo-600 px-2 text-white text-center ml-1"
                          >
                            +
                          </button>
                        </p>

                        <div className="flex">
                          <button
                            onClick={() => clearCart(cart.id)}
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

          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p className="tracking-wider">₹ {getCartTotal().toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6">
              {userId ? (
                <Link
                  to="/checkout"
                  className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Checkout
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Checkout
                </Link>
              )}
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                or{" "}
                <button
                  onClick={() => navigation(-1)}
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
