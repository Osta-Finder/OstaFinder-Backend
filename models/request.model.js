import mongoose from "mongoose";

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
      enum: ["pending", "accepted", "on_the_way", "in_progress", "completed", "rejected", "cancelled"],
      default: "pending",
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

requestSchema.pre("save", async function () {
  if (this.isNew && !this.requestNumber) {
    const lastRequest = await mongoose
      .model("Request")
      .findOne()
      .sort({ requestNumber: -1 });
    this.requestNumber = lastRequest ? lastRequest.requestNumber + 1 : 101;
  }
});

export default mongoose.model("Request", requestSchema);
