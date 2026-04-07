const Post = require("../models/Post");

const createPost = async (req, res, next) => {
  try {
    const { title, language, error, code, description } = req.body;

    if (!title || !language || !error || !code || !description) {
      res.status(400);
      throw new Error("All post fields are required");
    }

    const post = await Post.create({
      title,
      language,
      error,
      code,
      description,
      userId: req.user._id
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "name email reputation")
      .populate("acceptedAnswerId", "_id solution userId upvotes isAccepted");

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

const getPostsByUser = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser
};
