import React, { useEffect, useState } from 'react';
import "./view.css";
import NavBar from '../Components/NavBar';

const Viewer = () => {
  const [carts, setCarts] = useState([]); // State to store cart data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors

  // Fetch cart data from the backend API
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await fetch("https://waste-tool.apnimandi.us/api/carts", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the response as JSON
        setCarts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  // Function to convert data to CSV format
  const convertToCSV = (data) => {
    const headers = [
      'User Name',
      'User Role',
      'Product Name',
      'Product Subcategory',
      'Quantity',
      'SKU',
      'Image',
      'Date & Time',
    ].join(','); // CSV headers

    const rows = data.map((cart) =>
      cart.items.map((item) =>
        [
          `"${cart.user?.name || 'N/A'}"`,
          `"${cart.user?.role || 'N/A'}"`,
          `"${item.product?.productName || 'N/A'}"`,
          `"${item.product?.productSubcategory || 'N/A'}"`,
          `"${item.quantity || 'N/A'}"`,
          `"${item.product?.sku || 'N/A'}"`,
          `"${item.product?.Image || 'No Image'}"`,
          `"${new Date(cart.dateTime).toLocaleString() || 'N/A'}"`,
        ].join(',')
      )
    ).flat(); // Flatten the array

    return [headers, ...rows].join('\n'); // Combine headers and rows
  };

  // Function to trigger CSV download
  const downloadCSV = () => {
    const csvData = convertToCSV(carts);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Cart Viewer</h1>
      <NavBar />
      <button onClick={downloadCSV} style={{ marginBottom: '20px' }}>
        Export to CSV
      </button>
      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>User Name</th>
            <th>User Role</th>
            <th>Product Name</th>
            <th>Product Subcategory</th>
            <th>Quantity</th>
            <th>SKU</th>
            <th>Image</th>
            <th>Date & Time</th> {/* Added Date & Time Column */}
          </tr>
        </thead>
        <tbody>
          {carts?.map((cart) =>
            cart.items?.map((item, index) => (
              <tr key={`${cart._id}-${index}`}>
                <td>{cart.user?.name || 'N/A'}</td>
                <td>{cart.user?.role || 'N/A'}</td>
                <td>{item.product?.productName || 'N/A'}</td>
                <td>{item.product?.productSubcategory || 'N/A'}</td>
                <td>{item.quantity || 'N/A'}</td>
                <td>{item.product?.sku || 'N/A'}</td>
                <td>
                  {item.product?.Image ? (
                    <img
                      src={item.product.Image}
                      alt={item.product.productName}
                      style={{ width: '50px', height: '50px' }}
                    />
                  ) : (
                    'No Image'
                  )}
                </td>
                <td>{new Date(cart.dateTime).toLocaleString() || 'N/A'}</td> {/* Displaying Date & Time */}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Viewer;
