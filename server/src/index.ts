import { flushSentry } from "./config/sentry";

import { env } from "./config/env.config";
import { logger } from "./config/logger";

import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { shouldCompress } from "./config/compression";
import { corsOptions } from "./config/cors-options";
import { databaseConnection } from "./config/database";
import { apiLimiter } from "./config/limiter";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { sendResponse } from "./utils/response";

import addressRoutes from "./modules/address/address.routes";
import adminRoutes from "./modules/admin/admin.routes";
import cartRoutes from "./modules/cart/cart.routes";
import categoryRoutes from "./modules/category/category.routes";
import couponRoutes from "./modules/coupon/coupon.routes";
import invoiceRoutes from "./modules/invoice/invoice.routes";
import newsletterRoutes from "./modules/newsletter/newsletter.routes";
import orderRoutes from "./modules/order/order.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import productRoutes from "./modules/product/product.routes";
import reviewRoutes from "./modules/review/review.routes";
import userRoutes from "./modules/user/user.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import stripeWebhook from "./webhook/stripe.webhook";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression({ filter: shouldCompress, level: 6 }));
app.use("/api", stripeWebhook);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.get("/api/health", (req, res) => {
  sendResponse(res, 200, "Server is running", {
    status: "ok",
    uptime: process.uptime(),
  });
});

app.use("/api/address", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/product", productRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use((req, res) => {
  return sendResponse(res, 404, "Route not found", { code: "NOT_FOUND" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await databaseConnection();
    const port = env.PORT;
    app.listen(port, () => {
      logger.info(`Server Listening @ ${port}`);
    });
  } catch (error) {
    logger.error(error, "Failed to start server");

    await flushSentry(2000);

    process.exit(1);
  }
};

startServer();
