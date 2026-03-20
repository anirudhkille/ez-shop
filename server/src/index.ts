import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import compression from "compression";
import session from "express-session";
import cookieParser from "cookie-parser";
import { shouldCompress } from "./config/compression";
import { corsOptions } from "./config/corsOptions";
import { databaseConnection } from "./config/database";
import { apiLimiter } from "./config/limiter";
import passport from "./config/passport";
import { errorHandler } from "./middlewares/errorHandler";

import addressRoutes from "./routes/addressRoutes";
import adminRoutes from "./routes/adminRoutes";
import cartRoutes from "./routes/cartRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import userRoutes from "./routes/userRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import stripeWebhook from "./webhook/stripeWebhook";

const app = express();

app.use(compression());
app.use(cors(corsOptions));
app.use(compression({ filter: shouldCompress, level: 6 }));
app.use(stripeWebhook);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/address", addressRoutes);
app.use("/admin", adminRoutes);
app.use("/cart", cartRoutes);
app.use("/category", categoryRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/product", productRoutes);
app.use("/review", reviewRoutes);
app.use("/user", userRoutes);
app.use("/wishlist", wishlistRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await databaseConnection();
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Server Listening @ ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
