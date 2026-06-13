import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const addressSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: "Home",
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        street: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        area: {
            type: String,
            trim: true,
        },
        buildingNumber: {
            type: String,
            trim: true,
        },
        floor: {
            type: String,
            trim: true,
        },
        apartment: {
            type: String,
            trim: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const userSchema = new mongoose.Schema({
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
        enum : ["client" , "admin"],
        required : true
    } ,
    refreshToken: {
        type: String,
    },
    addresses: {
        type: [addressSchema],
        default: [],
    },
}, {
    timestamps: true
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparedPassword = function (pass) {
    return bcrypt.compare(pass, this.password);
};

// access token vs refresh token

// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: "15m",
//     });
// };

// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET_REFRSH, {
//         expiresIn: "7d",
//     });
// };

export default mongoose.model("User", userSchema);
