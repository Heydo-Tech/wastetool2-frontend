import React, { useEffect, useState } from 'react';
import "./view.css";
import NavBar from '../Components/NavBar';
const Viewer = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Show 10 items per page

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await fetch(`https://waste-tool.apnimandi.us/api/carts?page=${page}&limit=${limit}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        setCarts(data.carts || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCarts();
  }, [page]);

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Function to convert current page's data to CSV format
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

  // Function to download CSV file
  const downloadCSV = () => {
    const csvData = convertToCSV(carts);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carts_page_${page}.csv`;
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
        Export Current Page to CSV
      </button>

      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>User Name</th>
            {/* <th>User Role</th> */}
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
                {/* <td>{cart.user?.role || 'N/A'}</td> */}
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

      <div style={{ marginTop: '20px' }}>
        <button onClick={prevPage} disabled={page === 1}>Previous</button>
        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default Viewer;
