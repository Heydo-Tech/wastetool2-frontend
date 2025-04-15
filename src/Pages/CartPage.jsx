import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css'; // Import the CSS file
import NavBar from '../Components/NavBar';
function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');  // Get userId from localStorage
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      // If no userId in localStorage, redirect to login or another page
      navigate('/');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(` http://localhost:9004/cart/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        const data = await response.json();
        setCart(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId, navigate]);

  if (loading) {
    return <p className="loading">Loading cart...</p>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return <p className="empty-cart">Your cart is empty.</p>;
  }

  return (
    <div className="cart-page">
      <NavBar></NavBar>
      <h1 className="cart-title">Your Cart</h1>
      <div className="cart-items">
        {cart.items.map(item => (
          <div key={item.product._id} className="cart-item">
            <img src={item.product.Image} alt={item.product.productName} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.product.productName}</h3>
              <p>Subcategory: {item.product.productSubcategory}</p>
              <p>SKU: {item.product.sku}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.product.price}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h2>Cart Summary</h2>
        <p>Total Items: {cart.items.reduce((total, item) => total + item.quantity, 0)}</p>
        <p>Total Price: ${cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}</p>
      </div>
    </div>
  );
}

export default CartPage;