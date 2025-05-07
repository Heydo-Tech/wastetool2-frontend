import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/Register";
import WasteImages from "./Pages/WasteImages";
import Cart from "./Pages/Cart";
import CartPage from "./Pages/CartPage";
import Viewer from "./Pages/View";
import SSOLogin from "./Pages/SSOLogin";
import ProtectedRoute from "./Components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Router>
        <Routes>
        <Route path="/sso-login" element={<SSOLogin />} />
          {/* LoginPage is public */}
          <Route path="/" element={<LoginPage />} />
          {/* Register: admin only */}
          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={[import.meta.env.VITE_ADMIN_ROLE]}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          {/* WasteImages: wasteImage only */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute
                allowedRoles={[import.meta.env.VITE_WASTEIMAGE_ROLE]}
              >
                <WasteImages />
              </ProtectedRoute>
            }
          />
          {/* Cart: wasteImage only */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute
                allowedRoles={[import.meta.env.VITE_WASTEIMAGE_ROLE]}
              >
                <Cart />
              </ProtectedRoute>
            }
          />
          {/* CartPage: wasteImage only */}
          <Route
            path="/cartPage"
            element={
              <ProtectedRoute
                allowedRoles={[import.meta.env.VITE_WASTEIMAGE_ROLE]}
              >
                <CartPage />
              </ProtectedRoute>
            }
          />
          {/* Viewer: view only */}
          <Route
            path="/view"
            element={
              <ProtectedRoute allowedRoles={[import.meta.env.VITE_VIEW_ROLE]}>
                <Viewer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;