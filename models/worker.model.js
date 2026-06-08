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
    role : {
        type : String ,
        default : "worker",
        required : true
    } ,
    refreshToken: {
        type: String,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
        // required: [true, "يجب تحديد تصنيف الفني"]
    },
    price: {
    type: Number
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

// access token vs refresh token

// workerSchema.methods.generateAccessToken = function () {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: "15m",
//     });
// };

// workerSchema.methods.generateRefreshToken = function () {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET_REFRSH, {
//         expiresIn: "7d",
//     });
// };

export default mongoose.model("Worker", workerSchema);