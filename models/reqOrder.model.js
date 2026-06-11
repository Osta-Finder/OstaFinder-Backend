import mongoose from "mongoose";

const reqSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "الطلب يجب أن ينتمي لعميل"],
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "الطلب يجب أن يوجه لفني محدد"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "يرجى تحديد فئة الخدمة"],
    },
    description: {
      type: String,
      required: [true, "يرجى كتابة وصف المشكلة بالتفصيل"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "رقم الجوال مطلوب للتواصل"],
    },
    preferredTime: {
      type: Date,
      required: [true, "يرجى تحديد وقت الزيارة المفضل"],
    },

    location: {
      type: String,
      required: [true, " يرجى تحديد الموقع الجغرافي أو العنوان"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", reqSchema);
