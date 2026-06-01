import mongoose from "mongoose";

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
    amount: {
      type: Number,
      required: [true, "المبلغ مطلوب"],
      min: [0, "المبلغ يجب أن يكون أكبر من صفر"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "inProgress", "completed", "rejected", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.pre("save", async function (next) {
  if (this.isNew && !this.requestNumber) {
    const lastRequest = await mongoose
      .model("Request")
      .findOne()
      .sort({ requestNumber: -1 });
    this.requestNumber = lastRequest ? lastRequest.requestNumber + 1 : 101;
  }
  next();
});

export default mongoose.model("Request", requestSchema);
