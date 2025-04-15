import React, { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";

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
        const response = await fetch(
          `https://waste-tool.apnimandi.us/api/carts/flat?page=${page}&limit=${limit}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
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
      "User Name",
      "User Role",
      "Product Name",
      "Product Subcategory",
      "Quantity",
      "SKU",
      "Image",
      "Date & Time"
    ].join(",");

    const rows = data.map((item) =>
      [
        `"${item.user?.name || "N/A"}"`,
        `"${item.user?.role || "N/A"}"`,
        `"${item.product?.productName || "N/A"}"`,
        `"${item.product?.productSubcategory || "N/A"}"`,
        `"${item.quantity || "N/A"}"`,
        `"${item.product?.sku || "N/A"}"`,
        `"${item.product?.Image || "No Image"}"`,
        `"${item.dateTime ? new Date(item.dateTime).toLocaleString() : "N/A"}"`
      ].join(",")
    );

    return [headers, ...rows].join("\n");
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(items);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cart_items_page_${page}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="text-center text-gray-600 text-lg mt-16">Loading...</div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 text-lg mt-16">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Cart Items Viewer
        </h1>
        <div className="mb-6 text-center">
          <button
            onClick={downloadCSV}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
          >
            Export Current Page to CSV
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-gray-700 font-semibold">
                  User Name
                </th>
                <th className="px-4 py-3 text-gray-700 font-semibold">
                  Product Name
                </th>
                <th className="px-4 py-3 text-gray-700 font-semibold">
                  Product Subcategory
                </th>
                <th className="px-4 py-3 text-gray-700 font-semibold">
                  Quantity
                </th>
                <th className="px-4 py-3 text-gray-700 font-semibold">SKU</th>
                <th className="px-4 py-3 text-gray-700 font-semibold">Image</th>
                <th className="px-4 py-3 text-gray-700 font-semibold">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-600">
                    {item.user?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.product?.productName || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.product?.productSubcategory || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.quantity || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.product?.sku || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {item.product?.Image ? (
                      <img
                        src={item.product.Image}
                        alt={item.product.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.dateTime
                      ? new Date(item.dateTime).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={prevPage}
            disabled={page === 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-700 transition-all"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={page === totalPages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-700 transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Viewer;
