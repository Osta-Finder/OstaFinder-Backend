import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger.js";
import globalError from "./middlewares/error.middleware.js";
import ApiError from "./utils/ApiError.js";
import authRoute from "./routes/auth.route.js";
import categoryRoutes from "./routes/category.route.js";
import requestRoutes from "./routes/request.route.js";
import categoryRoute from "./routes/category.route.js";
import workerRoute from "./routes/worker.route.js"
import reqOrderRoute from "./routes/reqOrder.route.js"
import uploadRoute from "./routes/upload.route.js"
import userRoute from "./routes/user.route.js"
import Category from "./models/category.model.js"

const app = express();
app.set('query parser', 'extended');
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://ostafinderuserfront.vercel.app",
    ],
    credentials: true,
  }),
);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("DB connected successful");
    
    await seedCategories();
  } catch (err) {
    console.log("DB connection Failed");
    console.log(err.message);

    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      return;
    }

    const categories = [
      { name: "كهرباء", icon: "lightning" },
      { name: "سباكة", icon: "water" },
      { name: "تكييف وتبريد", icon: "snowflake" },
      { name: "نجارة", icon: "hammer" },
      { name: "دهان", icon: "paint" },
      { name: "سقالات", icon: "building" },
      { name: "تصليح الأسقف", icon: "wrench" },
      { name: "أعمال الحديد", icon: "wrench" },
    ];

    await Category.insertMany(categories);
    console.log("Categories seeded successfully");
  } catch (err) {
    console.log("Error seeding categories:", err.message);
  }
};

await connectDB();

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/auth", authRoute);
app.use("/requests", requestRoutes);
app.use("/categories", categoryRoute);
app.use("/workers", workerRoute);
app.use("/orders", reqOrderRoute);
app.use("/upload", uploadRoute);
app.use("/users", userRoute);

//invalid route
app.use((req, res, next) => {
  next(new ApiError(`Not Found : ${req.originalUrl}`, 404));
});

app.use(globalError);

const port = process.env.PORT || 8000;
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
