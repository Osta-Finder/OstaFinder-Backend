import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stars: {
      type: Number,
      required: [true, "التقييم مطلوب"],
      min: [1, "أقل تقييم هو 1"],
      max: [5, "أقصي تقييم هو 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "التعليق لا يتجاوز 500 حرف"],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Rating", ratingSchema);
