import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css'; // Import the CSS file

function NavBar() {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button className="nav-button" onClick={() => navigate('/cart')}>Cart</button>
      {/* <button className="nav-button" onClick={() => navigate('/cartpage')}>My Added Carts Items</button> */}
      <button className="nav-button" onClick={() => navigate('/portal')}>Home</button>
    </div>
  );
}

export default NavBar;