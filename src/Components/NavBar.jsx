import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCartIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";

function NavBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const role = localStorage.getItem("role") || "unknown";

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      window.location.href = import.meta.env.VITE_SSO_LOGIN_URL;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-[#F47820] shadow-2xl backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          <div className="flex-grow flex">
            <div className="bg-white px-2 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <img
                src="favicon.png"
                alt="Apni Mandi Logo"
                className="h-12 w-auto"
              />
            </div>
          </div>
          {role !== import.meta.env.VITE_VIEW_ROLE && (
            <>
              <button
                className="relative px-6 py-3 text-white font-semibold text-lg rounded-xl bg-[#73C049] hover:bg-[#5DA738] border border-[#F47820]/50 shadow-lg hover:shadow-xl hover:shadow-[#F47820]/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden flex items-center space-x-2"
                onClick={() => navigate("/portal")}
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="relative z-10 drop-shadow-md">Home</span>
              </button>
              <button
                className="relative px-6 py-3 ml-3 text-white font-semibold text-lg rounded-xl bg-[#73C049] hover:bg-[#5DA738] border border-[#F47820]/50 shadow-lg hover:shadow-xl hover:shadow-[#F47820]/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden flex items-center space-x-2"
                onClick={() => navigate("/cart")}
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <ShoppingCartIcon className="h-6 w-6 relative z-10" />
                <span className="relative z-10 drop-shadow-md">Cart</span>
              </button>
            </>
          )}
          <button
            className="relative px-6 py-3 ml-3 text-white font-semibold text-lg rounded-xl bg-[#73C049] hover:bg-[#5DA738] border border-[#FFFFFF]/50 shadow-lg hover:shadow-xl hover:shadow-[#F47820]/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden flex items-center space-x-2"
            onClick={handleLogout}
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <ArrowLeftOnRectangleIcon className="h-6 w-6 relative z-10" />
            <span className="relative z-10 drop-shadow-md">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
