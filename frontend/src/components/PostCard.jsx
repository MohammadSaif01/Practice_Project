import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  return (
    <article className="card post-card">
      <h3>
        <Link to={`/posts/${post._id}`}>{post.title}</Link>
      </h3>
      <p>
        <strong>Language:</strong> {post.language}
      </p>
      <p>
        <strong>Error:</strong> {post.error}
      </p>
      <p className="meta">
        Posted by {post.userId?.name || "Unknown"} on {new Date(post.createdAt).toLocaleString()}
      </p>
    </article>
  );
};

export default PostCard;
