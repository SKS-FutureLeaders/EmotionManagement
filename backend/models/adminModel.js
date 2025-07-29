import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileUrl: {
        type: String,
        required: true
    },
    mimeType: String,
    originalName: String,
    size: Number
});

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['image', 'video', 'text', 'pdf']
    },
    heading: {
        type: String,
        required: true
    },
    ageRange: {
        lower: {
            type: Number,
            required: true
        },
        upper: {
            type: Number,
            required: true
        }
    },
    description: {
        type: String,
        required: true
    },
    files: [fileSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const adminSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    type: { type: String, enum: ["admin"], default: "admin" },
    uploadedContent: [contentSchema]
});

const adminModel = mongoose.model("Admin", adminSchema);
export default adminModel;