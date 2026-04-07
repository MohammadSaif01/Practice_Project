import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";

const initialForm = {
  title: "",
  language: "",
  error: "",
  code: "",
  description: ""
};

const CreatePostPage = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/posts", form);
      navigate(`/posts/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1>Create a Programming Issue</h1>
      <form onSubmit={handleSubmit} className="card form">
        <input name="title" placeholder="Problem title" value={form.title} onChange={handleChange} required />
        <input
          name="language"
          placeholder="Programming language (e.g., JavaScript)"
          value={form.language}
          onChange={handleChange}
          required
        />
        <input name="error" placeholder="Error message" value={form.error} onChange={handleChange} required />
        <textarea
          name="code"
          placeholder="Paste your code snippet"
          value={form.code}
          onChange={handleChange}
          rows={8}
          required
        />
        <textarea
          name="description"
          placeholder="Describe what you expected and what happened"
          value={form.description}
          onChange={handleChange}
          rows={5}
          required
        />
        {error && <p className="error">{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Create Post"}
        </button>
      </form>
    </section>
  );
};

export default CreatePostPage;
