import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'; // Import the CSS file for styling
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/Register';
import WasteImages from './Pages/WasteImages';
import Cart from './Pages/Cart';
import CartPage from './Pages/CartPage';
import Viewer from './Pages/View';

function App() {
  return (
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
  );
}

export default App;
