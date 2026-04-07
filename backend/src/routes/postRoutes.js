const express = require("express");
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", protect, createPost);
router.get("/user/:userId", getPostsByUser);
router.get("/:id", getPostById);

module.exports = router;
