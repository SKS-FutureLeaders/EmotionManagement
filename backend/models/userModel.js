import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    age: { type: Number },
    contact: { type: String },
    loginMethod: { type: String, enum: ["email", "google", "facebook"], default: "email" },
    type: { type: String, enum: ["parent", "child"], default: "parent" },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Child"
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
