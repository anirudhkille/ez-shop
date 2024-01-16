import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    zipCode: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("/payment", { state: formData });
  };

  return (
    <section className="min-h-[100dvh]">
      <div className="max-w-[900px] m-auto max-md:w-full pt-10 flex flex-wrap">
        <div className="flex-1 px-4 py-6 sm:px-6">
          <form
            className="border-slate-700 border rounded"
            onSubmit={handleSubmit}
          >
            <h2 className=" bg-slate-100 p-2 font-bold">
              Personal Information
            </h2>
            <div className="flex  gap-2 p-2 flex-wrap ">
              <div className=" flex-1 px-2 ">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  required
                  type="text"
                  id="firstName"
                  name="fName"
                  value={formData.fName}
                  onChange={handleChange}
                  className="mt-1 p-2 border-slate-700 border rounded-md "
                />
              </div>
              <div className=" flex-1 px-2 ">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  required
                  type="text"
                  id="lastName"
                  name="lName"
                  value={formData.lName}
                  onChange={handleChange}
                  className="mt-1 p-2 border border-slate-700 rounded-md "
                />
              </div>
            </div>

            <div className="flex gap-2 p-2 justify-around flex-wrap">
              <div className=" flex-1 px-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 p-2 border border-slate-700 rounded-md "
                />
              </div>
              <div className=" flex-1 px-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  id="phone"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 p-2 border  border-slate-700 rounded-md "
                />
              </div>
            </div>

            <div className="mb-4 flex-1 px-4 ">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="mt-1 p-2 border border-slate-700 rounded-md w-3/4"
              ></textarea>
            </div>

            <div className="flex gap-2 p-2 justify-around flex-wrap">
              <div className=" flex-1 px-2">
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  required
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 p-2 border border-slate-700 rounded-md "
                />
              </div>

              <div className=" flex-1 px-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  required
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 p-2 border  border-slate-700 rounded-md "
                />
              </div>

              <div className=" flex-1 px-2">
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Zip Code
                </label>
                <input
                  required
                  type="number"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  maxLength={6}
                  className="mt-1 p-2 border  border-slate-700 rounded-md "
                />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="text-white bg-indigo-500 px-5 py-3 rounded text-center mb-3"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
