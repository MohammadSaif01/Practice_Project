const express = require("express");
const {
  acceptAnswer,
  createAnswer,
  getAnswersByPost,
  upvoteAnswer
} = require("../controllers/answerController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/:postId", getAnswersByPost);
router.post("/:postId", protect, createAnswer);
router.patch("/upvote/:answerId", protect, upvoteAnswer);
router.patch("/accept/:answerId", protect, acceptAnswer);

module.exports = router;
