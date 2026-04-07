import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar-wrap">
      <div className="navbar container">
        <Link to="/" className="brand">
          DevHelp
        </Link>
        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          {isAuthenticated && <NavLink to="/create">Create Post</NavLink>}
          {isAuthenticated && <NavLink to={`/profile/${user._id}`}>Profile</NavLink>}
          {isAuthenticated && <span className="nav-rep">Rep: {user.reputation || 0}</span>}
          {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
          {!isAuthenticated && <NavLink to="/signup">Signup</NavLink>}
          {isAuthenticated && (
            <button className="button button-light" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
