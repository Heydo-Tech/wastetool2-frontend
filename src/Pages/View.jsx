import React, { useEffect, useState } from 'react';
import "./view.css";
import NavBar from '../Components/NavBar';

const Viewer = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await fetch("https://waste-tool.apnimandi.us/api/carts");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setCarts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  const convertToCSV = (data) => {
    const headers = [
      'User Name',
      'User Role',
      'Product Name',
      'Product Subcategory',
      'Quantity',
      'SKU',
      'Image',
      'Date & Time'
    ].join(',');

    const rows = data.flatMap(cart =>
      cart.items.map(item => 
        [
          `"${cart.user?.name || 'N/A'}"`,
          `"${cart.user?.role || 'N/A'}"`,
          `"${item.product?.productName || 'N/A'}"`,
          `"${item.product?.productSubcategory || 'N/A'}"`,
          `"${item.quantity || 'N/A'}"`,
          `"${item.product?.sku || 'N/A'}"`,
          `"${item.product?.Image || 'No Image'}"`,
          `"${item.dateTime ? new Date(item.dateTime).toLocaleString() : 'N/A'}"`
        ].join(',')
      )
    );

    return [headers, ...rows].join('\n');
  };

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
            <th>Date & Time</th> 
          </tr>
        </thead>
        <tbody>
          {carts?.map(cart =>
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
                <td>{item.dateTime ? new Date(item.dateTime).toLocaleString() : 'N/A'}</td> 
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Viewer;
