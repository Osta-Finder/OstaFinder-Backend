import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    source: {
        type: String,
        enum: ["platform", "outside"],
        default: "platform",
    },
    status: {
        type: String,
        enum: ["completed", "in_progress", "cancelled"],
        default: "completed",
    },
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    location: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: [{
        type: String,
    }]
}, {
    timestamps: true
});

export default mongoose.model("Portfolio", portfolioSchema);
