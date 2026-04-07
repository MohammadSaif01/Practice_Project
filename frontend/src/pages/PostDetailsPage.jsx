import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const COMMENT_PAGE_SIZE = 8;
const COMMENT_MAX_DEPTH = 3;

const buildCommentTree = (comments) => {
  const map = new Map();
  comments.forEach((comment) => {
    map.set(comment._id, { ...comment, replies: [] });
  });

  const roots = [];
  map.forEach((comment) => {
    if (comment.parentCommentId && map.has(comment.parentCommentId)) {
      map.get(comment.parentCommentId).replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
};

const CommentTree = ({ comments, onReply, answerId, maxDepth, collapsedRoots, onToggleCollapse, rootId }) => {
  return (
    <div className="comment-tree">
      {comments.map((comment) => (
        <article key={comment._id} className="comment-item">
          <p>{comment.text}</p>
          <p className="meta">
            {comment.userId?.name || "Unknown"} ({comment.userId?.reputation || 0} rep) at {" "}
            {new Date(comment.createdAt).toLocaleString()}
          </p>
          {comment.depth < maxDepth && (
            <button
              type="button"
              className="link-button"
              onClick={() => onReply(answerId, comment._id, comment.userId?.name || "User")}
            >
              Reply
            </button>
          )}
          {(comment.depth === 0 || rootId === comment._id) && comment.replies?.length > 0 && (
            <button
              type="button"
              className="link-button"
              onClick={() => onToggleCollapse(answerId, comment._id)}
            >
              {collapsedRoots[answerId]?.has(comment._id) ? "Expand" : "Collapse"}
            </button>
          )}
          {comment.replies?.length > 0 && !collapsedRoots[answerId]?.has(rootId || comment._id) ? (
            <div className="comment-children">
              <CommentTree
                comments={comment.replies}
                onReply={onReply}
                answerId={answerId}
                maxDepth={maxDepth}
                collapsedRoots={collapsedRoots}
                onToggleCollapse={onToggleCollapse}
                rootId={rootId || comment._id}
              />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
};

const PostDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [post, setPost] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [commentsByAnswer, setCommentsByAnswer] = useState({});
  const [commentPageByAnswer, setCommentPageByAnswer] = useState({});
  const [commentPaginationByAnswer, setCommentPaginationByAnswer] = useState({});
  const [collapsedRootsByAnswer, setCollapsedRootsByAnswer] = useState({});
  const [commentSortByAnswer, setCommentSortByAnswer] = useState({});
  const [commentInputByAnswer, setCommentInputByAnswer] = useState({});
  const [replyTargetByAnswer, setReplyTargetByAnswer] = useState({});
  const [solution, setSolution] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCommentsByAnswer = async (answerId, page = 1, append = false) => {
    const sort = commentSortByAnswer[answerId] || "oldest";
    const response = await api.get(
      `/comments/answer/${answerId}?page=${page}&limit=${COMMENT_PAGE_SIZE}&maxDepth=${COMMENT_MAX_DEPTH}&sort=${sort}`
    );

    const payload = response.data;
    setCommentsByAnswer((prev) => ({
      ...prev,
      [answerId]: append ? [...(prev[answerId] || []), ...payload.comments] : payload.comments
    }));
    setCommentPaginationByAnswer((prev) => ({
      ...prev,
      [answerId]: payload.pagination
    }));
    setCommentPageByAnswer((prev) => ({
      ...prev,
      [answerId]: page
    }));
  };

  const loadData = async () => {
    try {
      const [postRes, answersRes] = await Promise.all([api.get(`/posts/${id}`), api.get(`/answers/${id}`)]);
      setPost(postRes.data);
      setAnswers(answersRes.data);

      const commentResults = await Promise.all(
        answersRes.data.map((answer) => {
          const page = commentPageByAnswer[answer._id] || 1;
          const sort = commentSortByAnswer[answer._id] || "oldest";
          return api.get(
            `/comments/answer/${answer._id}?page=${page}&limit=${COMMENT_PAGE_SIZE}&maxDepth=${COMMENT_MAX_DEPTH}&sort=${sort}`
          );
        })
      );

      const nextCommentsByAnswer = {};
      const nextPaginationByAnswer = {};
      answersRes.data.forEach((answer, index) => {
        nextCommentsByAnswer[answer._id] = commentResults[index].data.comments;
        nextPaginationByAnswer[answer._id] = commentResults[index].data.pagination;
      });
      setCommentsByAnswer(nextCommentsByAnswer);
      setCommentPaginationByAnswer(nextPaginationByAnswer);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!solution.trim()) return;

    try {
      await api.post(`/answers/${id}`, { solution });
      setSolution("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer");
    }
  };

  const handleUpvote = async (answerId) => {
    const previousAnswers = answers;
    const target = answers.find((item) => item._id === answerId);
    if (!target) return;

    const toggled = !target.hasUpvoted;
    setAnswers((prev) =>
      prev.map((item) =>
        item._id === answerId
          ? {
              ...item,
              hasUpvoted: toggled,
              upvotes: toggled ? item.upvotes + 1 : Math.max(0, item.upvotes - 1)
            }
          : item
      )
    );

    try {
      await api.patch(`/answers/upvote/${answerId}`);
      await loadData();
    } catch (err) {
      setAnswers(previousAnswers);
      setError(err.response?.data?.message || "Failed to upvote");
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.patch(`/answers/accept/${answerId}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept answer");
    }
  };

  const handleReplyTarget = (answerId, parentCommentId, authorName) => {
    setReplyTargetByAnswer((prev) => ({
      ...prev,
      [answerId]: {
        parentCommentId,
        label: `Replying to ${authorName}`
      }
    }));
  };

  const handleCommentSubmit = async (e, answerId) => {
    e.preventDefault();
    const text = commentInputByAnswer[answerId]?.trim();
    if (!text) return;

    try {
      await api.post(`/comments/answer/${answerId}`, {
        text,
        parentCommentId: replyTargetByAnswer[answerId]?.parentCommentId || null
      });
      setCommentInputByAnswer((prev) => ({ ...prev, [answerId]: "" }));
      setReplyTargetByAnswer((prev) => ({ ...prev, [answerId]: null }));
      await fetchCommentsByAnswer(answerId, 1, false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleLoadMoreComments = async (answerId) => {
    try {
      const currentPage = commentPageByAnswer[answerId] || 1;
      const nextPage = currentPage + 1;
      await fetchCommentsByAnswer(answerId, nextPage, true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load more comments");
    }
  };

  const handleCommentSortChange = async (answerId, sort) => {
    setCommentSortByAnswer((prev) => ({
      ...prev,
      [answerId]: sort
    }));
    try {
      const response = await api.get(
        `/comments/answer/${answerId}?page=1&limit=${COMMENT_PAGE_SIZE}&maxDepth=${COMMENT_MAX_DEPTH}&sort=${sort}`
      );
      setCommentsByAnswer((prev) => ({
        ...prev,
        [answerId]: response.data.comments
      }));
      setCommentPaginationByAnswer((prev) => ({
        ...prev,
        [answerId]: response.data.pagination
      }));
      setCommentPageByAnswer((prev) => ({
        ...prev,
        [answerId]: 1
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sort comments");
    }
  };

  const handleToggleCollapse = (answerId, rootCommentId) => {
    setCollapsedRootsByAnswer((prev) => {
      const currentSet = prev[answerId] ? new Set(prev[answerId]) : new Set();
      if (currentSet.has(rootCommentId)) {
        currentSet.delete(rootCommentId);
      } else {
        currentSet.add(rootCommentId);
      }
      return {
        ...prev,
        [answerId]: currentSet
      };
    });
  };

  const isPostOwner = Boolean(user?._id && post?.userId?._id && user._id === post.userId._id);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <section className="grid gap-lg">
      <article className="card">
        <h1>{post.title}</h1>
        <p>
          <strong>Language:</strong> {post.language}
        </p>
        <p>
          <strong>Error:</strong> {post.error}
        </p>
        <p>
          <strong>Description:</strong> {post.description}
        </p>
        <p className="meta">Asked by {post.userId?.name || "Unknown"}</p>
        <h3>Code Snippet</h3>
        <pre>{post.code}</pre>
      </article>

      <section className="card">
        <h2>Solutions ({answers.length})</h2>
        {answers.length === 0 && <p>No answers yet.</p>}

        <div className="grid gap-md">
          {answers.map((answer) => (
            <article key={answer._id} className="answer-item">
              {answer.isAccepted && <p className="accepted-badge">Accepted Answer</p>}
              <p>{answer.solution}</p>
              <p className="meta">
                By {answer.userId?.name || "Unknown"} ({answer.userId?.reputation || 0} rep) on{" "}
                {new Date(answer.createdAt).toLocaleString()}
              </p>
              <div className="actions-row">
                <span>Upvotes: {answer.upvotes}</span>
                <div className="inline-actions">
                  {isAuthenticated && (
                    <button className="button button-light" onClick={() => handleUpvote(answer._id)}>
                      {answer.hasUpvoted ? "Remove Upvote" : "Upvote"}
                    </button>
                  )}
                  {isAuthenticated && isPostOwner && !answer.isAccepted && (
                    <button className="button button-light" onClick={() => handleAcceptAnswer(answer._id)}>
                      Accept
                    </button>
                  )}
                </div>
              </div>

              <section className="comments-section">
                <h3>Discussion</h3>
                <div className="comments-toolbar">
                  <label htmlFor={`sort-${answer._id}`} className="meta">
                    Sort:
                  </label>
                  <select
                    id={`sort-${answer._id}`}
                    value={commentSortByAnswer[answer._id] || "oldest"}
                    onChange={(e) => handleCommentSortChange(answer._id, e.target.value)}
                  >
                    <option value="oldest">Oldest</option>
                    <option value="newest">Newest</option>
                    <option value="top">Top</option>
                  </select>
                </div>
                {commentsByAnswer[answer._id]?.length ? (
                  <CommentTree
                    comments={buildCommentTree(commentsByAnswer[answer._id])}
                    onReply={handleReplyTarget}
                    answerId={answer._id}
                    maxDepth={COMMENT_MAX_DEPTH}
                    collapsedRoots={collapsedRootsByAnswer}
                    onToggleCollapse={handleToggleCollapse}
                  />
                ) : (
                  <p className="meta">No comments yet.</p>
                )}

                {commentPaginationByAnswer[answer._id]?.hasNextPage && (
                  <button
                    type="button"
                    className="button button-light"
                    onClick={() => handleLoadMoreComments(answer._id)}
                  >
                    Load More Comments
                  </button>
                )}

                {isAuthenticated && (
                  <form onSubmit={(e) => handleCommentSubmit(e, answer._id)} className="form compact-form">
                    {replyTargetByAnswer[answer._id]?.label ? (
                      <p className="meta">
                        {replyTargetByAnswer[answer._id].label}{" "}
                        <button
                          type="button"
                          className="link-button"
                          onClick={() =>
                            setReplyTargetByAnswer((prev) => ({
                              ...prev,
                              [answer._id]: null
                            }))
                          }
                        >
                          Cancel
                        </button>
                      </p>
                    ) : null}
                    <textarea
                      placeholder="Join discussion on this solution"
                      value={commentInputByAnswer[answer._id] || ""}
                      onChange={(e) =>
                        setCommentInputByAnswer((prev) => ({
                          ...prev,
                          [answer._id]: e.target.value
                        }))
                      }
                      rows={3}
                      required
                    />
                    <button className="button button-light" type="submit">
                      Add Comment
                    </button>
                  </form>
                )}
              </section>
            </article>
          ))}
        </div>
      </section>

      {isAuthenticated && (
        <section className="card">
          <h2>Submit a Solution</h2>
          <form onSubmit={handleSubmitAnswer} className="form">
            <textarea
              placeholder="Share your explanation and corrected code"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={6}
              required
            />
            <button className="button" type="submit">
              Post Solution
            </button>
          </form>
        </section>
      )}
    </section>
  );
};

export default PostDetailsPage;
