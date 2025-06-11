import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function NavBar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#F47820] shadow-2xl backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          {/* Logo */}
          <div className="flex-grow flex items-center">
            <div className="bg-white px-2 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <img
                src="favicon.png"
                alt="Apni Mandi Logo"
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Hamburger Button (Small Screens) */}
          <button
            className="sm:hidden p-2 text-white hover:bg-[#73C049] rounded-lg transition-all"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* Navigation Links */}
          <div
            className={`${
              isOpen ? "block" : "hidden"
            } sm:flex sm:items-center absolute sm:static top-20 left-0 w-full sm:w-auto bg-[#F47820] sm:bg-transparent flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3 p-4 sm:p-0 transition-all duration-300 ease-in-out`}
          >
            {role !== "view" && (
              <>
                <button
                  className="relative px-6 py-3 text-white font-semibold text-lg rounded-xl bg-[#73C049] hover:bg-[#5DA738] border border-[#F47820]/50 shadow-lg hover:shadow-xl hover:shadow-[#F47820]/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden flex items-center space-x-2 w-full sm:w-auto justify-center"
                  onClick={() => {
                    navigate("/portal");
                    setIsOpen(false);
                  }}
                  aria-label="Go to Home"
                >
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <span className="relative z-10 drop-shadow-md">Home</span>
                </button>
                <button
                  className="relative px-6 py-3 text-white font-semibold text-lg rounded-xl bg-[#73C049] hover:bg-[#5DA738] border border-[#F47820]/50 shadow-lg hover:shadow-xl hover:shadow-[#F47820]/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden flex items-center space-x-2 w-full sm:w-auto justify-center"
                  onClick={() => {
                    navigate("/cart");
                    setIsOpen(false);
                  }}
                  aria-label="Go to Cart"
                >
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <ShoppingCartIcon className="h-6 w-6 relative z-10" />
                  <span className="relative z-10 drop-shadow-md">Cart</span>
                </button>
              </>
            )}
            <button
              className="relative px-6 py-3 text-white font-semibold text-lg rounded-xl bg-[#73C049] hover:bg-[#5DA738] border border-[#FFFFFF]/50 shadow-lg hover:shadow-xl hover:shadow-[#F47820]/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group overflow-hidden flex items-center space-x-2 w-full sm:w-auto justify-center"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              aria-label="Logout"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <ArrowLeftOnRectangleIcon className="h-6 w-6 relative z-10" />
              <span className="relative z-10 drop-shadow-md">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;