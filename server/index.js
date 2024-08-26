import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./router/userRouter.js";
import orderRouter from "./router/orderRouter.js";
import connectDb from "./database/connectDb.js";
import { apiLimiter } from "./config/limiter.js";

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS.split(",");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

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
