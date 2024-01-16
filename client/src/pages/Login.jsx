import { useState } from "react";
import Toast from "../components/Toast";
Toast;
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import { CircularProgress } from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useUserContext();
  const navigate = useNavigate();

  const handleValidation = (e) => {
    e.preventDefault();

    const body = {
      email,
      password,
    };

    axios
      .post("https://ez-shop-server.onrender.com/api/login", body)
      .then((res) => {
        navigate("/");
        login(res.data._id);
        setLoading(true);
      })
      .catch((error) => {
        setErrorMessage("Invalid email or password");
        callingToast();
        console.error("Login failed:", error);
      })
      .finally(() => setLoading(false));
  };

  const callingToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-5">
        <img
          className="mx-auto h-10 w-auto"
          src="/logo.png"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Login in to your account
        </h2>
      </div>
      {showToast && <Toast message={errorMessage} />}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" method="POST" onSubmit={handleValidation}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-1">
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
              Log in
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 font-semibold">
          New to EZ Shop ?
          <button
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 mx-2"
            onClick={() => navigate("/signUp")}
          >
            Create an account
          </button>
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

export default Login;
