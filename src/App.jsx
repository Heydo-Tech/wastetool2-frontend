import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/Register';
import WasteImages from './Pages/WasteImages';
import Cart from './Pages/Cart';
import CartPage from './Pages/CartPage';
import Viewer from './Pages/View';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/portal" element={<WasteImages />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/cartPage" element={<CartPage />} />
          <Route path="/view" element={<Viewer />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;