import React, { useEffect, useState } from 'react';
import "./view.css";
import NavBar from '../Components/NavBar';

const Viewer = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`https://waste-tool.apnimandi.us/api/carts/flat?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setItems(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchItems();
  }, [page]);

  const nextPage = () => page < totalPages && setPage(page + 1);
  const prevPage = () => page > 1 && setPage(page - 1);

  const convertToCSV = (data) => {
    const headers = [
      'User Name', 'User Role', 'Product Name', 'Product Subcategory',
      'Quantity', 'SKU', 'Image', 'Date & Time'
    ].join(',');

    const rows = data.map(item =>
      [
        `"${item.user?.name || 'N/A'}"`,
        `"${item.user?.role || 'N/A'}"`,
        `"${item.product?.productName || 'N/A'}"`,
        `"${item.product?.productSubcategory || 'N/A'}"`,
        `"${item.quantity || 'N/A'}"`,
        `"${item.product?.sku || 'N/A'}"`,
        `"${item.product?.Image || 'No Image'}"`,
        `"${item.dateTime ? new Date(item.dateTime).toLocaleString() : 'N/A'}"`
      ].join(',')
    );

    return [headers, ...rows].join('\n');
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(items);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart_items_page_${page}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Cart Items Viewer</h1>
      <NavBar />

      <button onClick={downloadCSV} style={{ marginBottom: '20px' }}>
        Export Current Page to CSV
      </button>

      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Product Name</th>
            <th>Product Subcategory</th>
            <th>Quantity</th>
            <th>SKU</th>
            <th>Image</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.user?.name || 'N/A'}</td>
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
                ) : 'No Image'}
              </td>
              <td>{item.dateTime ? new Date(item.dateTime).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <button onClick={prevPage} disabled={page === 1}>Previous</button>
        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default Viewer;
