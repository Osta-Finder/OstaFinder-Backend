import mongoose from "mongoose";

const workerPortfolioSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "يجب تحديد الفني"],
    },
    title: {
      type: String,
      required: [true, "عنوان العمل مطلوب"],
      trim: true,
      maxlength: [100, "العنوان لا يتجاوز 100 حرف"],
    },
    imageUrl: {
      type: String,
      required: [true, "صورة العمل مطلوبة"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "الوصف لا يتجاوز 300 حرف"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkerPortfolio", workerPortfolioSchema);
