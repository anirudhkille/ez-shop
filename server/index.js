import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import cors from "cors";
import router from "./router/UserRouter.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 7777;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(MONGO_URI);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};
connectDb();

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
