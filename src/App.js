import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';  // Import the CSS file for styling

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all products from the backend
  useEffect(() => {
    axios.get('http://localhost:5002/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  // Filter products based on the search query
  const filteredProducts = products.filter(product => 
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.productSubcategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App">
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
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product._id} className="product-item">
              <img src={product.Image} alt={product.productName} className="product-image" />
              <div className="product-details">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-subcategory">{product.productSubcategory}</p>
                <p className="product-sku">SKU: {product.sku}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
}

export default App;
