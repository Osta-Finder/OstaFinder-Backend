import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "worker",
        required: true
    },
    refreshToken: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    price: {
        type: Number
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'التقييم لا يمكن أن يكون أقل من 0'],
        max: [5, 'التقييم لا يمكن أن يتجاوز 5']
    },
    ratingsCount: {
        type: Number,
        default: 0,
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    // ── Profile Fields ──────────────────────────
    bio: {
        type: String,
        trim: true,
        maxlength: [1000, "النبذة لا تتجاوز 1000 حرف"],
    },
    yearsOfExperience: {
        type: Number,
        default: 0,
        min: [0, "سنوات الخبرة لا يمكن أن تكون سالبة"],
    },
    totalOrders: {
        type: Number,
        default: 0,
    },
    workingHours: {
        from: { type: String, default: "08:00" },
        to:   { type: String, default: "18:00" },
    },
    address: {
        type: String,
        trim: true,
    },
    profileImage: {
        type: String,
        trim: true,
    },
    tags: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true
});

workerSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

workerSchema.methods.comparedPassword = function (pass) {
    return bcrypt.compare(pass, this.password);
};

workerSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};

workerSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_REFRSH, {
        expiresIn: "7d",
    });
};

export default mongoose.model("Worker", workerSchema);
