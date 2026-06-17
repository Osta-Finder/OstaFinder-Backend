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
        sparse: true,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
        required: true,
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
    image: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        // required: [true, "يجب تحديد تصنيف الفني"]
    },
    price: {
        type: Number,
        // required: [true, 'يجب تحديد السعر المبدئي للخدمة']
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'التقييم لا يمكن أن يكون أقل من 0'],
        max: [5, 'التقييم لا يمكن أن يتجاوز 5']
    },
    isOnline: {
        type: Boolean,
        default: false
    },
  passwordChangedAt: Date,
    isOnboarded: {
        type: Boolean,
        default: false
    },
    onboardingCompleted: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedAt: {
        type: Date,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    yearsOfExperience: {
        type: Number,
    },
    bio: {
        type: String,
    },
    responseTime: {
        type: String,
        default: "1",
    },
    workHoursStart: {
        type: String,
        default: "08:00",
    },
    workHoursEnd: {
        type: String,
        default: "22:00",
    },
    profilePic: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    nationalId: {
        type: String,
    },
    certificates: [{
        type: String,
    }],
}, {
    timestamps: true
});

workerSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);

    if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; 
  }
//   next()
});

workerSchema.methods.comparedPassword = function (pass) {
    return bcrypt.compare(pass, this.password);
};


export default mongoose.model("Worker", workerSchema);