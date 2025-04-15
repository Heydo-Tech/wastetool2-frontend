import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';

function WasteImages() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("role") !== "wasteImage") {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    axios
      .get(`https://waste-tool.apnimandi.us/api/api/products`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => console.error('Error fetching products:', error));

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(existingCart);
    setCartCount(existingCart.reduce((acc, item) => acc + item.quantity, 0));
  }, []);

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.className = `custom-toast ${type}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const updatedCart = existingCart.map((item) =>
      item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
    );

    const isProductInCart = existingCart.some((item) => item._id === product._id);

    if (!isProductInCart) {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));

    showToast(`added to cart!`, "success");
  };

  const removeToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const updatedCart = existingCart
      .map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity > 0 ? item.quantity - 1 : item.quantity }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));

    showToast(`removed from cart!`, "info");
  };

  const getCartQuantity = (productId) => {
    const productInCart = cart.find((item) => item._id === productId);
    return productInCart ? productInCart.quantity : 0;
  };

  return (
    <div className="App">
      <NavBar />
      <h1 className="app-title">Product List</h1>

      <div className="top-bar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by product name or subcategory"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="cart-counter">
          🛒 Items in Cart: {cartCount}
        </div>
      </div>

      <div className="product-list">
        {products
          .filter((product) => {
            const name = product.productName?.toLowerCase() || '';
            const subcategory = product.productSubcategory?.toLowerCase() || '';
            return name.includes(searchQuery.toLowerCase()) || subcategory.includes(searchQuery.toLowerCase());
          })
          .map((product) => (
            <div key={product._id} className="product-item">
              <div className="cart-quantity-display">
                Quantity in Cart: {getCartQuantity(product._id)}
              </div>
              <img src={product.Image} alt={product.productName} className="product-image" />
              <div className="product-details">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-subcategory">{product.productSubcategory}</p>
                <p className="product-sku">SKU: {product.sku}</p>
                <button onClick={() => addToCart(product)}>Add to Cart</button>
                <button onClick={() => removeToCart(product)}>Remove from Cart</button>
              </div>
            </div>
          ))}
      </div>

      <button onClick={() => navigate('/cart')}>Go to Cart</button>
    </div>
  );
}

export default WasteImages;
