const express = require("express");
const { createComment, getCommentsByAnswer } = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/answer/:answerId", getCommentsByAnswer);
router.post("/answer/:answerId", protect, createComment);

module.exports = router;
