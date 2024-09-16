import React from "react";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import { Button } from "../../components";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center px-3 space-y-4 h-dvh">
      <Heading className="font-bold text-7xl sm:text-8xl md:text-9xl lg:text-[9rem] leading-none">
        404
      </Heading>
      <Heading className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
        Oops! Page not found.
      </Heading>
      <Text className="text-sm sm:text-xl md:text-2xl">
        The page you're looking for doesn't exist or has been moved.
      </Text>

      <Button variant="link" className="text-lg" onClick={() => navigate("/")}>
        Go back to home
      </Button>
    </div>
  );
};

export default NotFound;
