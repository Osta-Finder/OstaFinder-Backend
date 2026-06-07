import mongoose from "mongoose";

/**
 * WorkerService — الخدمات المتاحة للحجز عند فني معين
 * كل فني ممكن يكون عنده أكتر من خدمة، كل خدمة بسعر وتصنيف
 */
const workerServiceSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "يجب تحديد الفني"],
    },
    title: {
      type: String,
      required: [true, "عنوان الخدمة مطلوب"],
      trim: true,
      maxlength: [100, "عنوان الخدمة لا يتجاوز 100 حرف"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "وصف الخدمة لا يتجاوز 500 حرف"],
    },
    price: {
      type: Number,
      required: [true, "سعر الخدمة مطلوب"],
      min: [0, "السعر لا يمكن أن يكون سالبًا"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "يجب تحديد تصنيف الخدمة"],
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkerService", workerServiceSchema);
