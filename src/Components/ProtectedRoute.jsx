import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { toast } from "react-toastify";

const SSO_LOGIN_URL = import.meta.env.VITE_SSO_LOGIN_URL;

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, checkAuth, error, loading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-4xl font-semibold text-[#F47820]">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `${SSO_LOGIN_URL}?redirect=${currentUrl}`;
    return null;
  }

  const isAdmin = user.role === import.meta.env.VITE_ADMIN_ROLE;
  if (allowedRoles.length > 0 && !isAdmin) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center text-4xl font-semibold text-red-500">
          You do not have the required roles to access this page.
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
