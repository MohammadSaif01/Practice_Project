const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    depth: {
      type: Number,
      default: 0
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    }
  },
  { timestamps: true }
);

commentSchema.index({ answerId: 1, createdAt: 1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ answerId: 1, depth: 1 });

module.exports = mongoose.model("Comment", commentSchema);
