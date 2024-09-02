import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./router/userRouter.js";
import orderRouter from "./router/orderRouter.js";
import connectDb from "./database/connectDb.js";
import { apiLimiter } from "./config/limiter.js";
import compression from "compression";
import { corsOptions } from "./config/corsOptions.js";

dotenv.config();

const app = express();

app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());
app.use(apiLimiter);

const startServer = () => {
  app.get("/", (req, res) => {
    res.send("Api is running");
  });

  app.use("/user", userRouter);
  app.use("/order", orderRouter);

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
};

connectDb()
  .then(() => startServer())
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
