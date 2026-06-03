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
        enum: ["pending", "awaiting_approval", "in_progress", "completed", "cancelled", "rejected"],
        default: "pending",
    },
    timeAgo: {
        type: String,
        default: "Recently",
    }
}, {
    timestamps: true
});

export default mongoose.model("Request", requestSchema);
