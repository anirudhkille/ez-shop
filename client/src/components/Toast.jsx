import Alert from "@mui/material/Alert";
import React from "react";
import AlertTitle from "@mui/material/AlertTitle";

const Toast = ({ message }) => {
  return (
    <Alert severity="error" className="w-1/2 m-auto max-sm:w-full ">
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
};

export default Toast;
