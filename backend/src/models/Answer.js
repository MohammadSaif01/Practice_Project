const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    solution: {
      type: String,
      required: true
    },
    isAccepted: {
      type: Boolean,
      default: false
    },
    upvotes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

answerSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model("Answer", answerSchema);
