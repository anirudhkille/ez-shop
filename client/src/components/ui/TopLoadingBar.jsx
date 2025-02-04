import React, { forwardRef } from "react";
import LoadingBar from "react-top-loading-bar";

const TopLoadingBar = forwardRef((props, ref) => {
  return (
    <LoadingBar
      color="#2563EB"
      ref={ref}
      shadow={true}
      height={2.5}
      {...props}
    />
  );
});

export default TopLoadingBar;
