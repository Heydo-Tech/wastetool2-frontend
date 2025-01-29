import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function WasteImages() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [wasteQuantities, setWasteQuantities] = useState({}); // State to track waste quantities
  const [inputValues, setInputValues] = useState({}); // State to track input field values


  const navigate = useNavigate();



useEffect(()=>{
    if(localStorage.getItem("role")!="wasteImage"){
        navigate('/');
    }
})




  // Fetch all products from the backend
  useEffect(() => {
    axios
      .get('http://localhost:5002/api/products')
      .then((response) => {
        setProducts(response.data);

        // Initialize waste quantities and input field values to 0 for all products
        const initialValues = response.data.reduce((acc, product) => {
          acc[product._id] = 0;
          return acc;
        }, {});
        setWasteQuantities(initialValues);
        setInputValues(initialValues);
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  // Handle waste quantity increment
  const incrementWaste = (id) => {
    setWasteQuantities((prev) => ({
      ...prev,
      [id]: prev[id] + 1,
    }));
  };

  // Handle waste quantity decrement
  const decrementWaste = (id) => {
    setWasteQuantities((prev) => ({
      ...prev,
      [id]: Math.max(prev[id] - 1, 0), // Ensure quantity doesn't go below 0
    }));
  };

  // Handle input change
  const handleInputChange = (id, value) => {
    const numericValue = Math.max(Number(value), 0); // Ensure input is non-negative
    setInputValues((prev) => ({
      ...prev,
      [id]: numericValue,
    }));
  };

  // Handle setting waste quantity from input
// Handle setting waste quantity from input and update in backend
const setWasteFromInput = (id) => {
  const updatedQuantity = inputValues[id];

  if (updatedQuantity < 0) {
    alert('Quantity cannot be negative');
    return;
  }

  axios
    .put(`http://localhost:5002/api/products/${id}`, { Quantity: updatedQuantity })
    .then((response) => {
      alert('Waste quantity updated successfully');

      // Update the wasteQuantities state
      setWasteQuantities((prev) => ({
        ...prev,
        [id]: updatedQuantity,
      }));

      // Update the products state to reflect the new quantity
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, Quantity: updatedQuantity } : product
        )
      );
    })
    .catch((error) => {
      console.error('Error updating waste quantity:', error);
      alert('Failed to update waste quantity');
    });
};



  // Filter products based on the search query
  const filteredProducts = products.filter(
    (product) =>
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
          filteredProducts.map((product) => (
            <div key={product._id} className="product-item">
              <img src={product.Image} alt={product.productName} className="product-image" />
              <div className="product-details">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-subcategory">{product.productSubcategory}</p>
                <p className="product-sku">SKU: {product.sku}</p>
                <div className="waste-controls">
                  {/* <button onClick={() => incrementWaste(product._id)}>Add Waste</button> */}
                  {/* <button onClick={() => decrementWaste(product._id)}>Delete Waste</button> */}
                  <p>Waste Quantity: {product.Quantity||0}</p>
                </div>
                <div className="input-controls">
                  <input
                    type="number"
                    className="waste-input"
                    value={inputValues[product._id]}
                    onChange={(e) => handleInputChange(product._id, e.target.value)}
                    min="0"
                  />
                  <button onClick={() => setWasteFromInput(product._id)}>Set Waste</button>
                </div>
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

export default WasteImages;
