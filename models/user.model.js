import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
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
    role : {
        type : String ,
        enum : ["client" , "admin"],
        required : true
    } ,
    refreshToken: {
        type: String,
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