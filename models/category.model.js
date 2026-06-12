import mongoose from "mongoose";
import slugify from "slugify";

const CategoySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Category name must be at least 2 characters long"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
      index: true,
    },
    slug: { type: String, lowercase: true },
    icon: {
      type: String,
      required: [true, "Category icon identifier or URL is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

CategoySchema.pre("save", function (next) {
  if (this.isNew || this.isModified("name")) {
    this.slug = this.name
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\u0600-\u06FFa-z0-9-]+/g, "");
  }
  next();
});

export default mongoose.model("Category", CategoySchema);
