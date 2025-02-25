import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
function WasteImages() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [wasteQuantities, setWasteQuantities] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [cart, setCart] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("role") !== "wasteImage") {
      console.log(wasteQuantities);
      console.log(inputValues);
      console.log(cart);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    axios
      .get('https://waste-tool.apnimandi.us/api/api/products')
      .then((response) => {
        setProducts(response.data);
        const initialValues = response.data.reduce((acc, product) => {
          acc[product._id] = 0;
          return acc;
        }, {});
        setWasteQuantities(initialValues);
        setInputValues(initialValues);
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
  
    const updatedCart = existingCart.map((item) =>
      item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
    );
  
    const isProductInCart = existingCart.some((item) => item._id === product._id);
  
    if (!isProductInCart) {
      updatedCart.push({ ...product, quantity: 1 });
    }
  
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  

  return (
    <div className="App">
      <NavBar></NavBar>
      <h1 className="app-title">Product List</h1>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by product name or subcategory"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="product-list">
        {products.filter(
          (product) =>
            product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.productSubcategory.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((product) => (
          <div key={product._id} className="product-item">
            <img src={product.Image} alt={product.productName} className="product-image" />
            <div className="product-details">
              <h3 className="product-name">{product.productName}</h3>
              <p className="product-subcategory">{product.productSubcategory}</p>
              <p className="product-sku">SKU: {product.sku}</p>
              <p>Waste Quantity: {product.Quantity || 0}</p>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/cart')}>Go to Cart</button>
    </div>
  );
}

export default WasteImages;
