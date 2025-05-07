import React from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const SSO_LOGIN_URL = import.meta.env.VITE_SSO_LOGIN_URL;

  const handleSSOLogin = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `${SSO_LOGIN_URL}?redirect=${currentUrl}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <img src="favicon.png" alt="Apni Mandi Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome to Apni Mandi
        </h2>
        <button
          onClick={handleSSOLogin}
          className="w-full py-3 bg-gradient-to-r from-[#F47820] to-green-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
        >
          Login with SSO
        </button>
      </div>
    </div>
  );
};

export default LoginPage;