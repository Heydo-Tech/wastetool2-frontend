import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'; // Import the CSS file for styling
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/Register';
import WasteImages from './Pages/WasteImages';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/portal" element={<WasteImages />} />
    </Routes>
  </Router>
  );
}

export default App;
