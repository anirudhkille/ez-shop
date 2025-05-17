import compression from "compression";

export const shouldCompress = (req, res) => {
  if (req.headers["x-no-compression"]) {
    return false;
  }

  return compression.filter(req, res);
};
