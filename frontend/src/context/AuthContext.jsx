import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("devhelp_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("devhelp_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("devhelp_token", response.data.token);
    setUser(response.data.user);
  };

  const signup = async (name, email, password) => {
    const response = await api.post("/auth/signup", { name, email, password });
    localStorage.setItem("devhelp_token", response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem("devhelp_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: Boolean(user)
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
