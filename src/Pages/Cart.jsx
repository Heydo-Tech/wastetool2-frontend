import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css'; // Import the CSS file
import NavBar from '../Components/NavBar';

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Retrieve user ID from local storage

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(product => product._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent zero or negative quantity
    const updatedCart = cart.map(product => 
      product._id === productId ? { ...product, quantity: newQuantity } : product
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const saveCartToBackend = async () => {
    if (!userId) {
      alert('User not logged in!');
      return;
    }

    const cartData = cart.map(product => ({
      productId: product._id,
      quantity: product.quantity
    }));

    console.log(cartData); // Log cart data to debug

    try {
      const response = await fetch('https://waste-tool.apnimandi.us/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          items: cartData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save cart');
      }

      alert('Cart saved successfully!');
      localStorage.removeItem('cart');
      navigate('/portal');
      console.log('Cart saved:', await response.json());
    } catch (error) {
      console.error('Error saving cart:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="cart-container">
      <NavBar />
      <h1 className="cart-title">Shopping Cart</h1>
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cart.map((product) => (
            <div key={product._id} className="cart-item">
              <img src={product.Image} alt={product.productName} className="cart-image" />
              <div className="cart-details">
                <h3>{product.productName}</h3>
                <p>Subcategory: {product.productSubcategory}</p>
                <p>SKU: {product.sku}</p>
                <div className="quantity-control">
                  <button className="quantity-button" onClick={() => updateQuantity(product._id, product.quantity - 1)}>-</button>
                  <span>{product.quantity}</span>
                  <button className="quantity-button" onClick={() => updateQuantity(product._id, product.quantity + 1)}>+</button>
                </div>
                <button className="remove-button" onClick={() => removeFromCart(product._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="cart-actions">
        <button className="save-cart-button" onClick={saveCartToBackend}>Save Cart</button>
        <button className="back-button" onClick={() => navigate('/portal')}>Back to Products</button>
      </div>
    </div>
  );
}

export default Cart;
