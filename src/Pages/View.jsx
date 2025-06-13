import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";

// Simple in-memory cache for suggestions
const suggestionsCache = new Map();

const Viewer = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchProgress, setSearchProgress] = useState("");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [rangeError, setRangeError] = useState("");
  const limit = 10;
  const navigate = useNavigate();

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    if (localStorage.getItem("role") !== "view") {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!searchActive) {
      const fetchItems = async () => {
        try {
          setLoading(true);
          const url = `http://localhost:9004/carts/flat?page=${page}&limit=${limit}`;
          const response = await fetch(url);
          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
          const data = await response.json();
          setItems(data.items || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchItems();
    }
  }, [page, searchActive]);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Check cache first
      if (suggestionsCache.has(query)) {
        const cachedSuggestions = suggestionsCache.get(query);
        setSuggestions(cachedSuggestions);
        setShowSuggestions(cachedSuggestions.length > 0);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:9004/api/suggestions?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        // Combine productName and SKU for product suggestions
        const formattedSuggestions = (data.suggestions || []).map(suggestion => {
          if (suggestion.type === 'product') {
            return {
              ...suggestion,
              displayValue: `${suggestion.productName || 'Unknown Product'} ${suggestion.sku || ''}`.trim()
            };
          }
          return { ...suggestion, displayValue: suggestion.value };
        });

        // Cache the suggestions
        suggestionsCache.set(query, formattedSuggestions);
        // Limit cache size
        if (suggestionsCache.size > 100) {
          suggestionsCache.delete(suggestionsCache.keys().next().value);
        }

        setSuggestions(formattedSuggestions);
        setShowSuggestions(formattedSuggestions.length > 0);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  const searchItems = async ({ query, startDate, endDate }) => {
    try {
      setLoading(true);
      setSearchProgress("Searching...");
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (startDate) params.append("startDate", new Date(startDate).toISOString());
      if (endDate) params.append("endDate", new Date(endDate + "T23:59:59.999Z").toISOString());
      const url = `http://localhost:9004/api/carts/search?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const matchedItems = data.items || [];
      setItems(matchedItems);
      setTotalPages(1);

      if (matchedItems.length === 0) {
        setError("No items found for this search");
        setTimeout(() => {
          clearSearch();
        }, 3000);
      } else {
        setError(null);
      }
      setSearchProgress("");
    } catch (err) {
      setError(err.message);
      setSearchProgress("");
      setTimeout(() => {
        clearSearch();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsForPageRange = async (startPage, endPage) => {
    try {
      setLoading(true);
      setSearchProgress(`Fetching pages ${startPage} to ${endPage}...`);
      const pagePromises = [];
      for (let p = startPage; p <= endPage; p++) {
        const url = `http://localhost:9004/carts/flat?page=${p}&limit=${limit}`;
        pagePromises.push(
          fetch(url)
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
              return res.json();
            })
            .then((data) => data.items || [])
        );
      }
      const allItems = (await Promise.all(pagePromises)).flat();
      setSearchProgress("");
      return allItems;
    } catch (err) {
      setError(`Failed to fetch items: ${err.message}`);
      setSearchProgress("");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.length >= 3 || startDate) {
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setError("Start date must be before or equal to end date");
        return;
      }
      setSearchActive(true);
      setShowSuggestions(false);
      searchItems({ query: searchQuery, startDate, endDate });
    } else {
      setError("Search query must be 3+ characters, or select a date");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (e, suggestion) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Suggestion clicked:", suggestion); // Debug log
    // Populate input with SKU for products or name for users
    const queryValue = suggestion.type === 'product' ? suggestion.sku || suggestion.value : suggestion.value;
    console.log("Setting searchQuery to:", queryValue); // Debug log
    setSearchQuery(queryValue);
    setShowSuggestions(false);
    setSearchActive(true);
    searchItems({ query: queryValue, startDate, endDate });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSearchActive(false);
    setPage(1);
    setSearchProgress("");
    setError(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

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

  const downloadCSV = (type = "current", start = page, end = page) => {
    if (type === "range") {
      const startNum = parseInt(startPage);
      const endNum = parseInt(endPage);
      if (
        isNaN(startNum) ||
        isNaN(endNum) ||
        startNum < 1 ||
        endNum < startNum ||
        endNum > totalPages
      ) {
        setRangeError(
          `Invalid range. Enter pages between 1 and ${totalPages}, with start ≤ end.`
        );
        return;
      }
      setRangeError("");
      fetchItemsForPageRange(startNum, endNum).then((allItems) => {
        if (allItems.length > 0) {
          const csvData = convertToCSV(allItems);
          const blob = new Blob([csvData], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `cart_items_pages_${startNum}-${endNum}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          setError("No items found in the selected page range");
        }
      });
    } else {
      const csvData = convertToCSV(items);
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cart_items${searchActive ? "_search" : "_page_" + page}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#F47820] border-solid"></div>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#F47820] to-[#73C049] bg-clip-text text-transparent">
            {searchProgress || "Loading..."}
          </p>
        </div>
      </div>
    );

  if (error && searchActive)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-8 border-l-4 border-red-500 animate-shake">
          <p className="text-lg font-semibold text-red-600">Error: {error}</p>
          <p className="text-sm text-gray-600 mt-2">Returning to main view in 3 seconds...</p>
          <button
            onClick={clearSearch}
            className="mt-4 px-4 py-2 bg-[#F47820] text-white rounded-lg hover:bg-[#73C049] transition-all"
          >
            Return Now
          </button>
        </div>
      </div>
    );

  if (error && !searchActive)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-8 border-l-4 border-red-500 animate-shake">
          <p className="text-lg font-semibold text-red-600">Error: {error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Cart Items Viewer
        </h1>
        <div className="flex flex-col items-center mb-8 space-y-4">
          <div className="relative w-full max-w-3xl">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search by SKU, User Name, or Product Name (3+ chars)"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 300)} // Increased delay
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                    onMouseDown={(e) => handleSuggestionClick(e, suggestion)} // Use onMouseDown to capture before blur
                  >
                    {suggestion.type === "name" ? `Name: ${suggestion.displayValue}` : suggestion.displayValue}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-700">From:</label>
              <input
                type="date"
                className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-700">To:</label>
              <input
                type="date"
                className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={searchQuery.length < 3 && !startDate}
              className="px-4 py-2 bg-[#F47820] text-white rounded-lg disabled:bg-gray-300 hover:bg-[#73C049] transition-all"
            >
              Search
            </button>
            {searchActive && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="mb-6 text-center space-y-4">
          <div>
            <button
              onClick={() => downloadCSV("current")}
              className="px-6 py-2 bg-[#F47820] text-white font-semibold rounded-lg hover:bg-[#73C049] transition-all"
            >
              Export Current Page to CSV
            </button>
          </div>
          {!searchActive && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={startPage}
                  onChange={(e) => setStartPage(e.target.value)}
                  placeholder="Start Page"
                  className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="self-center">-</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                  placeholder="End Page"
                  className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => downloadCSV("range")}
                  disabled={!startPage || !endPage}
                  className="px-4 py-1 bg-[#F47820] text-white rounded-lg disabled:bg-gray-300 hover:bg-[#73C049] transition-all"
                >
                  Export Selected Pages
                </button>
              </div>
              {rangeError && (
                <p className="text-sm text-red-500">{rangeError}</p>
              )}
            </div>
          )}
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
        {!searchActive && (
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className="px-4 py-2 bg-[#F47820] text-white rounded-lg disabled:bg-gray-300 hover:bg-[#73C049] transition-all"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#F47820] text-white rounded-lg disabled:bg-gray-300 hover:bg-[#73C049] transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewer;