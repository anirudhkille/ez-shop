import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import compression from "compression";

import { shouldCompress } from "./config/compression.js";
import { corsOptions } from "./config/corsOptions.js";
import { databaseConnection } from "./config/database.js";
import { apiLimiter } from "./config/limiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

app.use(compression());
app.use(cors(corsOptions));
app.use(compression({ filter: shouldCompress, level: 6 }));
app.use(express.json());
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);

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
