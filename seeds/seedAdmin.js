import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@ostafinder.com" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save hook)
    const adminUser = new User({
      name: "Admin User",
      email: "admin@ostafinder.com",
      phoneNumber: "+1234567890",
      password: "admin123",
      role: "admin",
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@ostafinder.com");
    console.log("🔐 Password: admin123");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedAdmin();
