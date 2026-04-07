import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatePostPage from "./pages/CreatePostPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PostDetailsPage from "./pages/PostDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts/:id" element={<PostDetailsPage />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
