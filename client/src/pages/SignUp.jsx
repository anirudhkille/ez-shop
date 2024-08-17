import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupClicked, setSignupClicked] = useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const callingToast = (msg) => {
    toast.error(msg);
  };

  const handleValidation = (e) => {
    e.preventDefault();
    setSignupClicked(true);

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (password.length < 8) {
      callingToast("Password must contain a minimum of 8 characters");
    } else if (!password.match(passwordRegex)) {
      callingToast(
        "Password must contain at least 1 uppercase, 1 digit, and 1 special character"
      );
    } else {
      const body = {
        name,
        email,
        password,
      };

      axios
        .post("https://ez-shop-server.onrender.com/api/signUp", body)
        .then((res) => {
          navigate("/");
          dispatch(login(res.data._id));
          setLoading(true);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          callingToast("An error occurred. Please try again.");
        });
    }
  };

  return (
    <div className="flex flex-col justify-center px-6 py-12 lg:px-8 ">
      {signupClicked && <ToastContainer />}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="w-auto h-10 mx-auto"
          src="/logo.png"
          alt="Your Company"
        />
        <h2 className="mt-5 text-2xl font-bold leading-9 tracking-tight text-center text-gray-900">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-3" method="POST" onSubmit={handleValidation}>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Name
              </label>
            </div>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Create an account
            </button>
          </div>
        </form>

        <p className="mt-5 text-sm font-semibold text-center text-gray-500">
          Already an user ?
          <Link
            className="mx-2 font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            to="/login"
          >
            SignUp
          </Link>
          {loading ? (
            <div className="mt-1">
              <CircularProgress style={{ color: "#6366F1" }} />
            </div>
          ) : (
            ""
          )}
        </p>
      </div>
    </div>
  );
};

export default SignUp;
