import mongoose from "mongoose";

<<<<<<< HEAD
const requestSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming User model is the client
        required: false, // Make false for now to allow mocked data insertion if needed
    },
    clientName: {
        type: String,
        required: true,
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
    },
    serviceTitle: {
        type: String,
        required: true,
    },
    location: {
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
    price: {
        type: Number,
        default: null,
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "awaiting_approval", "in_progress", "completed", "cancelled", "rejected"],
        default: "pending",
    },
    timeAgo: {
        type: String,
        default: "Recently",
    }
}, {
    timestamps: true
=======
const requestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: Number,
      unique: true,
    },
    service: {
      type: String,
      required: [true, "الخدمة مطلوبة"],
      trim: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "الصنايعي مطلوب"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "المستخدم مطلوب"],
    },
    date: {
      type: Date,
      required: [true, "التاريخ مطلوب"],
    },
    address: {
      type: String,
      required: [true, "العنوان مطلوب"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "المبلغ مطلوب"],
      min: [0, "المبلغ يجب أن يكون أكبر من صفر"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "rejected", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.pre("save", async function () {
  if (this.isNew && !this.requestNumber) {
    const lastRequest = await mongoose
      .model("Request")
      .findOne()
      .sort({ requestNumber: -1 });
    this.requestNumber = lastRequest ? lastRequest.requestNumber + 1 : 101;
  }
>>>>>>> origin/main
});

export default mongoose.model("Request", requestSchema);
