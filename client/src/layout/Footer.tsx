import { Link } from "react-router";

const Footer = () => {
  const products = [
    { href: "men's clothing", name: "Mens" },
    { href: "women's clothing", name: "Womens" },
    { href: "electronics", name: "Electronics" },
    { href: "jewelery", name: "Accessories" },
  ];

  return (
    <footer className="w-full">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 py-10 sm:grid-cols-3 md:gap-8 max-sm:max-w-sm max-sm:mx-auto gap-y-8">
          <div className="mb-10">
            <Link to="/" className="flex items-center gap-2 font-bold">
              <img src="/logo.png" className="object-contain size-12" />
              EZ Shop
            </Link>
            <div className="flex mt-4 space-x-4">
              <Link
                to="https://github.com/anirudhkille"
                target="_blank"
                className="flex items-center justify-center rounded-full bg-primary w-9 h-9"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f5f5f5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github-icon lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Link>
              <Link
                to="https://www.linkedin.com/in/anirudh-kille/"
                target="_blank"
                className="flex items-center justify-center rounded-full bg-primary w-9 h-9"
              >
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 13 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.8794 11.5527V3.86835H0.318893V11.5527H2.87967H2.8794ZM1.59968 2.81936C2.4924 2.81936 3.04817 2.2293 3.04817 1.49188C3.03146 0.737661 2.4924 0.164062 1.61666 0.164062C0.74032 0.164062 0.167969 0.737661 0.167969 1.49181C0.167969 2.22923 0.723543 2.8193 1.5829 2.8193H1.59948L1.59968 2.81936ZM4.29668 11.5527H6.85698V7.26187C6.85698 7.03251 6.87369 6.80255 6.94134 6.63873C7.12635 6.17968 7.54764 5.70449 8.25514 5.70449C9.18141 5.70449 9.55217 6.4091 9.55217 7.44222V11.5527H12.1124V7.14672C12.1124 4.78652 10.8494 3.68819 9.16483 3.68819C7.78372 3.68819 7.17715 4.45822 6.84014 4.98267H6.85718V3.86862H4.29681C4.33023 4.5895 4.29661 11.553 4.29661 11.553L4.29668 11.5527Z"
                    fill="currentColor"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="text-left lg:mx-auto ">
            <h4 className="text-lg font-medium text-gray-900 mb-7">
              Quick Links
            </h4>
            <ul className="text-sm transition-all duration-500">
              <li className="mb-6">
                <Link to="/" className="text-gray-600 hover:text-primary">
                  Home
                </Link>
              </li>
              <li className="mb-6">
                <Link to="/cart" className="text-gray-600 hover:text-primary">
                  Cart
                </Link>
              </li>
              <li className="mb-6">
                <Link to="/login" className="text-gray-600 hover:text-primary">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-600 hover:text-primary">
                  Signup
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-left lg:mx-auto ">
            <h4 className="text-lg font-medium text-gray-900 mb-7">Products</h4>
            <ul className="text-sm transition-all duration-500">
              {products.map((p) => (
                <li className="mb-6" key={p.name}>
                <Link
                    to={`/products/${p.href}`}
                    key={p.name}
                    className="text-gray-600 hover:text-primary"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center border-t border-gray-200 py-7">
          ©EZ Shop 2024, All rights reserved. |{" "}
          <Link to="https://anirudhkille.com" className="font-semibold">
            Anirudh Kille
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
