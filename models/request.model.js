import mongoose from "mongoose";

export const statusMap = {
  pending: "معلقة",
  accepted: "مقبولة",
  on_the_way: "في الطريق",
  in_progress: "قيد التنفيذ",
  completed: "مكتملة",
  rejected: "مرفوضة",
  cancelled: "ملغية",
};

export const reverseStatusMap = {
  الكل: null,
  معلقة: "pending",
  مقبولة: "accepted",
  "في الطريق": "on_the_way",
  "قيد التنفيذ": "in_progress",
  مكتملة: "completed",
  مرفوضة: "rejected",
  ملغية: "cancelled",
};

const requestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
    },
    service: {
        type: String,
        required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "يرجى تحديد فئة الخدمة"],
    },
    phoneNumber: {
      type: String,
      required: [true, "رقم الجوال مطلوب"],
    },
    date: {
        type: Date,
        required: true,
    },
    description: { type: String, required: true },
    address: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    distance: {
        type: String,
        default: "Unknown",
    },
    urgency: {
        type: String,
        enum: ["normal", "urgent"],
        default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "on_the_way", "in_progress", "completed", "rejected", "cancelled"],
      default: "pending",
    },
    image: {
      type: String,
      default: null,
    },
    eta: {
      type: String,
      default: "",
    },
  },
  clientName: { // ?
    type: String,
    required: true,
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "يرجى تحديد فئة الخدمة"],
  },
  phoneNumber: {
    type: String,
    required: [true, "رقم الجوال مطلوب"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "يرجى تحديد فئة الخدمة"],
  },
  phoneNumber: {
    type: String,
    required: [true, "رقم الجوال مطلوب"],
  },
  date: {
    type: Date,
    required: true,
  },
  description: { type: String, required: true },
  address: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    default: "Unknown",
  },
  urgency: {
    type: String,
    enum: ["normal", "urgent"],
    default: "normal",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "on_the_way", "in_progress", "completed", "rejected", "cancelled"],
    default: "pending",
  },
  image: {
    type: String,
    default: null,
  },
  eta: {
    type: String,
    default: "",
  },
},
  {
    timestamps: true,
  },
);

// requestSchema.pre("save", async function () {
//   if (this.isNew && !this.requestNumber) {
//     const lastRequest = await mongoose
//       .model("Request")
//       .findOne()
//       .sort({ requestNumber: -1 });
//     this.requestNumber = lastRequest ? lastRequest.requestNumber + 1 : 101;
//   }
// });

export default mongoose.model("Request", requestSchema);
