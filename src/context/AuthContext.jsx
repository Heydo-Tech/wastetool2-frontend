import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const SSO_AUTH_URL = import.meta.env.VITE_SSO_AUTH_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token");
      }
      const res = await axios.get(`${SSO_AUTH_URL}/verify-auth`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAuthenticated(true);
      setUser(res.data.user);
      setError(null);
      localStorage.setItem("username", res.data.user.name);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userId", res.data.user._id);
      await axios.post("http://localhost:9004/sync-user", res.data.user, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await axios.post(
          `${SSO_AUTH_URL}/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
    } catch (err) {
      setError(err.response?.data?.message || "Logout failed");
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, checkAuth, logout, error, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
