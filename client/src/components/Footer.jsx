import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedinIcon from "@mui/icons-material/LinkedIn";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="text-gray-400 bg-gray-900 body-font ">
      <div className="container flex flex-col items-center px-5 py-8 mx-auto sm:flex-row">
        <a className="flex items-center justify-center font-medium text-white title-font md:justify-start">
          <img src="/logo.png" alt="logo" height={35} width={35} />
          <span className="ml-3 text-xl">EZ Shop</span>
        </a>
        <p className="mt-4 text-sm text-gray-400 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-800 sm:py-2 sm:mt-0">
          © 2024 EZ Shop —
          <a
            href="https://github.com/anirudhkille"
            className="ml-1 text-gray-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            @anirudh-kille
          </a>
        </p>

        <span className="inline-flex justify-center mt-4 sm:ml-auto sm:mt-0 sm:justify-start">
          <Link
            className="text-gray-400 hover:text-indigo-500"
            to="https://instagram.com/anirudh_kille"
            target="_blank"
          >
            <InstagramIcon />
          </Link>

          <Link
            className="ml-3 text-gray-400 hover:text-indigo-500"
            to="https://www.github.com/anirudhkille"
            target="_blank"
          >
            <GitHubIcon />
          </Link>

          <Link
            className="ml-3 text-gray-400 hover:text-indigo-500"
            to="https://www.linkedin.com/in/anirudh-kille"
            target="_blank"
          >
            <LinkedinIcon />
          </Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
