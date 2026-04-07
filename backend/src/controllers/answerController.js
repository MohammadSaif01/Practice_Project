const Answer = require("../models/Answer");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const User = require("../models/User");
const Vote = require("../models/Vote");

const createAnswer = async (req, res, next) => {
  try {
    const { solution } = req.body;

    if (!solution) {
      res.status(400);
      throw new Error("Solution is required");
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const answer = await Answer.create({
      postId: req.params.postId,
      userId: req.user._id,
      solution
    });

    const populatedAnswer = await Answer.findById(answer._id).populate("userId", "name email");

    res.status(201).json(populatedAnswer);
  } catch (err) {
    next(err);
  }
};

const getAnswersByPost = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let currentUserId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (error) {
        currentUserId = null;
      }
    }

    const answers = await Answer.find({ postId: req.params.postId })
      .populate("userId", "name email reputation")
      .sort({ isAccepted: -1, upvotes: -1, createdAt: -1 });

    if (!currentUserId) {
      return res.status(200).json(answers.map((answer) => ({ ...answer.toObject(), hasUpvoted: false })));
    }

    const answerIds = answers.map((answer) => answer._id);
    const votes = await Vote.find({ userId: currentUserId, answerId: { $in: answerIds } });
    const votedSet = new Set(votes.map((vote) => vote.answerId.toString()));

    const answersWithVotes = answers.map((answer) => ({
      ...answer.toObject(),
      hasUpvoted: votedSet.has(answer._id.toString())
    }));

    res.status(200).json(answersWithVotes);
  } catch (err) {
    next(err);
  }
};

const upvoteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.answerId);

    if (!answer) {
      res.status(404);
      throw new Error("Answer not found");
    }

    if (answer.userId.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot upvote your own answer");
    }

    const existingVote = await Vote.findOne({
      answerId: answer._id,
      userId: req.user._id
    });

    if (existingVote) {
      await Vote.findByIdAndDelete(existingVote._id);
      answer.upvotes = Math.max(0, answer.upvotes - 1);
      await answer.save();

      await User.findByIdAndUpdate(answer.userId, {
        $inc: { reputation: -5 }
      });

      return res.status(200).json({
        answer,
        upvoted: false
      });
    }

    await Vote.create({
      answerId: answer._id,
      userId: req.user._id
    });

    answer.upvotes += 1;
    await answer.save();

    await User.findByIdAndUpdate(answer.userId, {
      $inc: { reputation: 5 }
    });

    res.status(200).json({
      answer,
      upvoted: true
    });
  } catch (err) {
    next(err);
  }
};

const acceptAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.answerId);

    if (!answer) {
      res.status(404);
      throw new Error("Answer not found");
    }

    const post = await Post.findById(answer.postId);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the post owner can accept an answer");
    }

    if (post.acceptedAnswerId?.toString() === answer._id.toString()) {
      return res.status(200).json({ message: "Answer is already accepted" });
    }

    let previousAcceptedAnswer = null;
    if (post.acceptedAnswerId) {
      previousAcceptedAnswer = await Answer.findById(post.acceptedAnswerId);
    }

    await Answer.updateMany({ postId: post._id }, { isAccepted: false });
    answer.isAccepted = true;
    await answer.save();

    post.acceptedAnswerId = answer._id;
    await post.save();

    const shouldAwardAcceptedBonus =
      !previousAcceptedAnswer || previousAcceptedAnswer.userId.toString() !== answer.userId.toString();

    if (shouldAwardAcceptedBonus) {
      await User.findByIdAndUpdate(answer.userId, {
        $inc: { reputation: 15 }
      });
    }

    if (
      previousAcceptedAnswer &&
      previousAcceptedAnswer.userId.toString() !== answer.userId.toString()
    ) {
      await User.findByIdAndUpdate(previousAcceptedAnswer.userId, {
        $inc: { reputation: -15 }
      });
    }

    const populatedAnswer = await Answer.findById(answer._id).populate("userId", "name email reputation");
    res.status(200).json(populatedAnswer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAnswer,
  getAnswersByPost,
  upvoteAnswer,
  acceptAnswer
};
