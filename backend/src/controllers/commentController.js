const Answer = require("../models/Answer");
const Comment = require("../models/Comment");

const MAX_REPLY_DEPTH = 3;
const DEFAULT_PAGE_SIZE = 10;

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const createComment = async (req, res, next) => {
  try {
    const { text, parentCommentId } = req.body;
    let depth = 0;

    if (!text || !text.trim()) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    const answer = await Answer.findById(req.params.answerId);
    if (!answer) {
      res.status(404);
      throw new Error("Answer not found");
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.answerId.toString() !== req.params.answerId) {
        res.status(400);
        throw new Error("Invalid parent comment");
      }

      depth = parentComment.depth + 1;
      if (depth > MAX_REPLY_DEPTH) {
        res.status(400);
        throw new Error(`Maximum reply depth is ${MAX_REPLY_DEPTH}`);
      }
    }

    const comment = await Comment.create({
      answerId: req.params.answerId,
      userId: req.user._id,
      text: text.trim(),
      depth,
      parentCommentId: parentCommentId || null
    });

    const populatedComment = await Comment.findById(comment._id).populate("userId", "name email reputation");
    res.status(201).json(populatedComment);
  } catch (err) {
    next(err);
  }
};

const getCommentsByAnswer = async (req, res, next) => {
  try {
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, toInt(req.query.limit, DEFAULT_PAGE_SIZE)));
    const maxDepth = Math.max(0, toInt(req.query.maxDepth, MAX_REPLY_DEPTH));
    const sort = ["newest", "oldest", "top"].includes(req.query.sort) ? req.query.sort : "oldest";

    const allComments = await Comment.find({ answerId: req.params.answerId, depth: { $lte: maxDepth } })
      .populate("userId", "name email reputation")
      .sort({ createdAt: 1 });

    const commentsByParent = new Map();
    const roots = [];

    allComments.forEach((comment) => {
      const parentKey = comment.parentCommentId ? comment.parentCommentId.toString() : null;
      if (!commentsByParent.has(parentKey)) {
        commentsByParent.set(parentKey, []);
      }
      commentsByParent.get(parentKey).push(comment);

      if (!comment.parentCommentId) {
        roots.push(comment);
      }
    });

    const descendantCount = (root) => {
      let count = 0;
      const visit = (node) => {
        const children = commentsByParent.get(node._id.toString()) || [];
        count += children.length;
        children.forEach(visit);
      };
      visit(root);
      return count;
    };

    if (sort === "newest") {
      roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "top") {
      roots.sort((a, b) => {
        const byDesc = descendantCount(b) - descendantCount(a);
        if (byDesc !== 0) return byDesc;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    }

    const totalRoots = roots.length;
    const totalPages = Math.max(1, Math.ceil(totalRoots / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const pagedRoots = roots.slice(start, start + limit);

    const selectedComments = [];
    const collectDescendants = (comment, depthRemaining) => {
      selectedComments.push(comment);
      if (depthRemaining <= 0) return;

      const children = commentsByParent.get(comment._id.toString()) || [];
      children.forEach((child) => collectDescendants(child, depthRemaining - 1));
    };

    pagedRoots.forEach((root) => collectDescendants(root, maxDepth));

    res.status(200).json({
      comments: selectedComments,
      pagination: {
        page: safePage,
        limit,
        totalRoots,
        totalPages,
        hasNextPage: safePage < totalPages,
        maxDepth,
        sort
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComment,
  getCommentsByAnswer
};
