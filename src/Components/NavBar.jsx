import React from "react";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();
  console.log("NavBar rendered in context");

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <button
            className="px-4 py-2 mx-2 text-white font-medium border-2 border-white rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-300"
            onClick={() => navigate("/cart")}
          >
            Cart
          </button>
          <button
            className="px-4 py-2 mx-2 text-white font-medium border-2 border-white rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-300"
            onClick={() => navigate("/portal")}
          >
            Home
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
