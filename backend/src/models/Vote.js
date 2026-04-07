const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
);

voteSchema.index({ answerId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
