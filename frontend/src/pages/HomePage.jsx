import { useEffect, useState } from "react";

import api from "../api/client";
import PostCard from "../components/PostCard";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <h1>Recent Developer Problems</h1>
      {posts.length === 0 ? <p>No posts yet. Be the first to ask a question.</p> : null}
      <div className="grid gap-md">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default HomePage;
