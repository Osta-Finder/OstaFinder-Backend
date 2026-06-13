import mongoose from "mongoose";
import "dotenv/config";
import Category from "./models/category.model.js";
import Worker from "./models/worker.model.js";

async function main() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("Connected to MongoDB successfully");

    const worker = await Worker.findById("6a2da30b6704cee4d9cb99bd").populate("category");
    console.log("\nSpecific Worker profile:");
    console.log(JSON.stringify(worker, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error connecting or querying:", err);
  }
}

main();
