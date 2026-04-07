import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/client";
import PostCard from "../components/PostCard";

const ProfilePage = () => {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/posts/user/${userId}`)
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load profile posts"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <h1>User Profile</h1>
      <p>Total posts: {posts.length}</p>
      <div className="grid gap-md">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default ProfilePage;
