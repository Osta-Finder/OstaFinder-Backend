import express from "express";
import mongoose from "mongoose"
import "dotenv/config"

import globalError from "./middlewares/error.middleware.js"
import ApiError from "./utils/ApiError.js";
import categoryRoutes from "./routes/category.route.js"

const app = express();
app.use(express.json())

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("DB connected successful");
  } catch (err) {
    console.log("DB connection Failed");
    console.log(err.message);

    process.exit(1)
  }
};

await connectDB()

// Routes
app.use("/categories", categoryRoutes)

//invalid route
app.use((req, res, next)=>{
  next(new ApiError(`Not Found : ${req.originalUrl}`, 404))
})

app.use(globalError);

const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log(`server is running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Errors :${err.name} | ${err.message}`);
  server.close(() => {
    console.log(`shutting down..`);
    process.exit(1);
  });
});

