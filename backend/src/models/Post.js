const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    language: {
      type: String,
      required: true,
      trim: true
    },
    error: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    acceptedAnswerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null
    }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ language: 1 });

module.exports = mongoose.model("Post", postSchema);
