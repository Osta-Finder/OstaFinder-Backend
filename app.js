import express from "express";
import authRoute from "./routes/auth.route.js";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import globalError from "./middlewares/erorr.midlleware.js";
import cors from 'cors';
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoute);
app.get("/", (req, res) => {
  res.send("test");
});

app.use(globalError)
app.listen(process.env.PORT, () => {
  console.log("test worked!");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("server is running");
  })
