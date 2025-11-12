import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import compression from "compression";

import { shouldCompress } from "./config/compression";
import { corsOptions } from "./config/corsOptions";
import { databaseConnection } from "./config/database";
import { apiLimiter } from "./config/limiter";
import { errorHandler } from "./middlewares/errorHandler";

import addressRoutes from "./routes/addressRoutes";
import adminRoutes from "./routes/adminRoutes";
import cartRoutes from "./routes/cartRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import userRoutes from "./routes/userRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";

const app = express();

app.use(compression());
app.use(cors(corsOptions));
app.use(compression({ filter: shouldCompress, level: 6 }));
app.use(express.json());
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/address", addressRoutes);
app.use("/admin", adminRoutes);
app.use("/cart", cartRoutes);
app.use("/category", categoryRoutes);
app.use("/order", orderRoutes);
app.use("/product", productRoutes);
app.use("/review", reviewRoutes);
app.use("/stripe", stripeRoutes);
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
