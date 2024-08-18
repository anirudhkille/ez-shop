import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit"; // Import rate limiting middleware
import userRouter from "./router/userRouter.js";
import orderRouter from "./router/orderRouter.js";
import connectDb from "./database/connectDb.js";

dotenv.config();

const app = express();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again later.",
});

app.use(cors());
app.use(express.json());
app.use("/api/", apiLimiter); // Apply rate limiting to all /api/ routes

const startServer = () => {
  app.get("/api", (req, res) => {
    res.send("Sirrius API's");
  });

  app.use("/api/user", userRouter);
  app.use("/api/order", orderRouter);

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
