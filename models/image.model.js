import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  bucket: {
    type: String,
    required: true,
    enum: ["profile-pics", "problem-images", "official-docs", "images", "services"],
  },

}, {
  timestamps: true,
});

export default mongoose.model("Image", imageSchema);
