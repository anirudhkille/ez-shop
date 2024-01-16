import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedinIcon from "@mui/icons-material/LinkedIn";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="text-gray-400 bg-gray-900 body-font ">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <a className="flex title-font font-medium items-center md:justify-start justify-center text-white">
          <img src="/logo.png" alt="logo" height={35} width={35} />
          <span className="ml-3 text-xl">EZ Shop</span>
        </a>
        <p className="text-sm text-gray-400 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-800 sm:py-2 sm:mt-0 mt-4">
          © 2024 EZ Shop —
          <a
            href="https://github.com/anirudhkille"
            className="text-gray-500 ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            @anirudh-kille
          </a>
        </p>

        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
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
