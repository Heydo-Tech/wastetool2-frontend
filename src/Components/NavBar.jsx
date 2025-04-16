import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

function NavBar() {
  const navigate = useNavigate();
  console.log("NavBar rendered in context");

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 shadow-2xl backdrop-blur-lg bg-opacity-30 sticky top-0 z-50 animate-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button
            className="relative px-6 py-3 text-white font-semibold text-lg rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 border border-indigo-300/50 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden"
            onClick={() => navigate("/portal")}
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <span className="relative z-10 drop-shadow-md">Home</span>
          </button>
          <button
            className="relative px-6 py-3 text-white font-semibold text-lg rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 border border-indigo-300/50 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden flex items-center space-x-2"
            onClick={() => navigate("/cart")}
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <ShoppingCartIcon className="h-6 w-6 relative z-10" />
            <span className="relative z-10 drop-shadow-md">Cart</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
