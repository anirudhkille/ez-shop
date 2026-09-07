import dotenv from "dotenv";
dotenv.config();

import { validateEnv } from "./config/env";
validateEnv();

import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import session from "express-session";
import cookieParser from "cookie-parser";
import { shouldCompress } from "./config/compression";
import { corsOptions } from "./config/corsOptions";
import { databaseConnection } from "./config/database";
import { apiLimiter } from "./config/limiter";
import passport from "./config/passport";
import { errorHandler } from "./middlewares/errorHandler";

import addressRoutes from "./modules/address/address.routes";
import adminRoutes from "./modules/admin/admin.routes";
import cartRoutes from "./modules/cart/cart.routes";
import categoryRoutes from "./modules/category/category.routes";
import newsletterRoutes from "./modules/newsletter/newsletter.routes";
import orderRoutes from "./modules/order/order.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import productRoutes from "./modules/product/product.routes";
import reviewRoutes from "./modules/review/review.routes";
import userRoutes from "./modules/user/user.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import stripeWebhook from "./webhook/stripeWebhook";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression({ filter: shouldCompress, level: 6 }));
app.use("/api", stripeWebhook);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/api/address", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/product", productRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wishlist", wishlistRoutes);

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
