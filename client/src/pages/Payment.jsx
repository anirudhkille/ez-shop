import React, { useState } from "react";
import { useCartContext } from "../context/cartContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const Payment = () => {
  const { cartItems, getCartTotal } = useCartContext();
  const [paymentTypeCard, setPaymentTypeCard] = useState("cash");
  const { userId } = useSelector((state) => state.user.id);

  const [cardData, setCardData] = useState({
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const location = useLocation();
  const data = location.state;
  const navigate = useNavigate();

  const subTotal = getCartTotal();
  const taxCharge = subTotal * 0.1;
  let shippmentCharge = 0;
  if (subTotal < 500) {
    shippmentCharge = 100;
  } else {
    shippmentCharge = 0;
  }
  const totalAmount = subTotal + taxCharge + shippmentCharge;
  const cartProducts = cartItems.map((items) => ({
    id: items.id,
    name: items.title,
    quantity: items.quantity,
    price: items.price,
    image: items.image,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const orderProduct = async () => {
    try {
      const response = await axios.post(
        "https://ez-shop-server.onrender.com/api/order",
        {
          userId: userId,
          products: cartProducts,
          shippingAddress: {
            fName: data.fName,
            lName: data.lName,
            address: data.address,
            zipCode: data.zipCode,
            mobileNo: data.phone,
            emailId: data.email,
          },
          amountPayable: totalAmount,
          paymentMethod: paymentTypeCard,
        }
      );
      navigate("/order-summary");
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentTypeCard === "card") {
      if (cardData.cardName === "") {
        alert("Name field can't be empty");
      } else if (
        cardData.cardNumber.length !== 16 ||
        !/^\d+$/.test(cardData.cardNumber)
      ) {
        alert("Card number must have 16 digits and only contain digits");
      } else {
        orderProduct();
      }
    }
    orderProduct();
  };

  return (
    <section className="min-h-[100vh]">
      <div className="max-w-[1500px] m-auto max-md:w-full pt-10 flex flex-wrap max-sm:block">
        <div className="px-4 py-6 grow sm:px-6">
          <div className="border border-slate-700">
            <h2 className="p-2 font-bold bg-slate-100">Order Summary</h2>
            <ul role="list" className="divide-y divide-gray-200">
              {cartItems?.map((cart) => (
                <li className="py-6 mt-3 max-sm:block" key={cart.id}>
                  <div className="flex text-base font-medium text-gray-900  max-[280px]:block ">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 max-sm:h-14 max-sm:w-14 ml-4 w-[>280px]-w-full ">
                      <img
                        src={cart.image}
                        alt={cart.title}
                        className="object-contain object-center w-full h-full"
                      />
                    </div>
                    <div className="block">
                      <h3 className="ml-3">{cart.title}</h3>
                      <p className="mt-1 mb-2 ml-3 text-sm text-gray-500">
                        {cart.category}
                      </p>
                      <div className="flex">
                        <p className="ml-3 mr-2 tracking-wider">
                          ₹{(cart.price * 10).toFixed(2)}
                        </p>{" "}
                        X<p className="ml-2 text-gray-700">{cart.quantity}</p>
                        <p className="ml-20">
                          ₹ {(cart.price * 10).toFixed(2) * cart.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <hr></hr>
            <div className="flex p-2 text-base font-medium text-gray-900 justify-evenly">
              <div>
                <p>Subtotal</p>
                <p>Shipping</p>
                <p>Tax</p>
                <p>Amount Payable</p>
              </div>
              <div>
                <p className="tracking-wider">₹ {subTotal}</p>
                <p className="tracking-wider">₹ {shippmentCharge}</p>
                <p className="tracking-wider">₹ {taxCharge}</p>
                <p className="tracking-wider">₹ {totalAmount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-wrap flex-1 px-4 py-6 mx-auto sm:px-6">
          <div className="border border-slate-700">
            <h2 className="p-2 font-bold tracking-wider bg-slate-100">
              Deliver to:
            </h2>
            <div className="m-2 ">
              <p className="text-lg capitalize bold">
                {data?.fName} {data?.lName}
              </p>
              <p className="">
                {data?.address} , {data?.state}
              </p>
              <p>
                {data?.city} - {data?.zipCode}
              </p>
              <p>
                {data?.phone} | {data?.email}
              </p>
            </div>
          </div>

          <div className="mt-2 border border-slate-700 ">
            <h2 className="p-2 font-bold tracking-wider bg-slate-100">
              Payment method:
            </h2>

            <div className="flex flex-col border border-slate-700">
              <div className="flex items-center gap-2 px-2 ">
                <label htmlFor="cash" className="w-full px-3 py-2 font-bold">
                  <input
                    type="radio"
                    name="payment"
                    id="cash"
                    defaultChecked
                    className="mx-2"
                    required
                    onChange={() => {
                      setPaymentTypeCard("cash");
                    }}
                  />
                  Cash on Delivery
                </label>
              </div>

              <div className="border border-slate-700"></div>
              <div className="flex items-center gap-2 px-2 ">
                <label htmlFor="card" className="w-full px-3 py-2 font-bold">
                  <input
                    type="radio"
                    name="payment"
                    id="card"
                    className="mx-2"
                    onChange={() => {
                      setPaymentTypeCard("card");
                    }}
                  />
                  Debit or Credit Card
                </label>
              </div>
            </div>
            {paymentTypeCard === "card" ? (
              <div className="p-2 ">
                <input
                  type="text"
                  placeholder="Card Name"
                  name="cardName"
                  onChange={handleChange}
                  required
                  value={cardData.cardName}
                  className="w-full h-10 p-2 mb-2 border border-slate-700"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={16}
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleChange}
                  required
                  placeholder="Card Number"
                  className="w-full h-10 p-2 mb-2 border border-slate-700"
                />

                <div className="flex flex-wrap items-center justify-between">
                  <select
                    className="h-10 p-2 border border-slate-700 "
                    onChange={handleChange}
                    value={cardData.expiryMonth}
                    name="expiryMonth"
                  >
                    <option defaultChecked>MM</option>
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>

                  <select
                    className="h-10 p-2 ml-2 border border-slate-700"
                    onChange={handleChange}
                    value={cardData.expiryYear}
                    name="expiryYear"
                  >
                    <option disabled defaultValue>
                      YEAR
                    </option>
                    {Array.from({ length: 23 }, (_, index) => (
                      <option key={24 + index} value={24 + index}>
                        {24 + index}
                      </option>
                    ))}
                  </select>

                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={3}
                    inputMode="numeric"
                    onChange={handleChange}
                    name="cvv"
                    value={cardData.cvv}
                    className="w-1/4 h-10 p-2 mt-1 ml-1 border border-slate-700"
                  />
                </div>
              </div>
            ) : (
              ""
            )}
            <div className="flex items-center justify-center mt-2">
              <button
                className="px-5 py-2 m-auto mb-2 text-white bg-indigo-500 rounded "
                onClick={handlePlaceOrder}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Payment;
