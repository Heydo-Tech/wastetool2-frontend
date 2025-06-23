import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";

// Enhanced caching with TTL and size limits
class EnhancedCache {
  constructor(maxSize = 200, ttl = 5 * 60 * 1000) { // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    const expiry = Date.now() + this.ttl;
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }
}

// Enhanced cache instances
const suggestionsCache = new EnhancedCache(100, 2 * 60 * 1000); // 2 minutes for suggestions
const searchCache = new EnhancedCache(50, 5 * 60 * 1000); // 5 minutes for search results

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
  const [searchPage, setSearchPage] = useState(1);
const [searchTotalPages, setSearchTotalPages] = useState(1);
  const navigate = useNavigate();

  // Optimized debounce with cleanup
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Memoized API base URL
  const API_BASE = useMemo(() => 'https://waste-tool.apnimandi.us/api', []);   //http://localhost:9004

  useEffect(() => {
    if (localStorage.getItem("role") !== "view") {
      navigate("/");
    }
  }, [navigate]);

  // Optimized fetch with abort controller and caching
  const fetchWithCache = useCallback(async (url, cacheKey = null) => {
    const controller = new AbortController();
    
    try {
      // Check cache first if cacheKey provided
      if (cacheKey && searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey);
      }

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result if cacheKey provided
      if (cacheKey) {
        searchCache.set(cacheKey, data);
      }
      
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return null;
      }
      throw err;
    }
  }, []);

  // Optimized items fetching with caching
  useEffect(() => {
    if (!searchActive) {
      const fetchItems = async () => {
        try {
          setLoading(true);
          const cacheKey = `flat_page_${page}_${limit}`;
          const url = `${API_BASE}/carts/flat?page=${page}&limit=${limit}`;
          
          const data = await fetchWithCache(url, cacheKey);
          if (data) {
            setItems(data.items || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setError(null);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchItems();
    }
  }, [page, searchActive, API_BASE, fetchWithCache]);

  // Optimized suggestions fetching with enhanced caching
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const cacheKey = `suggestions_${query.toLowerCase()}`;
      
      // Check cache first
      if (suggestionsCache.has(cacheKey)) {
        const cachedSuggestions = suggestionsCache.get(cacheKey);
        setSuggestions(cachedSuggestions);
        setShowSuggestions(cachedSuggestions.length > 0);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/suggestions?query=${encodeURIComponent(query)}`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        // Format suggestions
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
        suggestionsCache.set(cacheKey, formattedSuggestions);

        setSuggestions(formattedSuggestions);
        setShowSuggestions(formattedSuggestions.length > 0);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250), // Reduced debounce time for better UX
    [API_BASE]
  );

  // Optimized search with caching
// Updated the searchItems function to include pagination
const searchItems = useCallback(async ({ query, startDate, endDate, page = 1 }) => {
  try {
    setLoading(true);
    setSearchProgress("Searching...");
    
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (startDate) params.append("startDate", new Date(startDate).toISOString());
    if (endDate) params.append("endDate", new Date(endDate + "T23:59:59.999Z").toISOString());
    params.append("page", page);
    params.append("limit", limit);
    
    const cacheKey = `search_${params.toString()}`;
    const url = `${API_BASE}/api/carts/search?${params.toString()}`;
    
    const data = await fetchWithCache(url, cacheKey);
    if (data) {
      const matchedItems = data.items || [];
      setItems(matchedItems);
      setSearchTotalPages(data.pagination?.totalPages || 1);
      setSearchPage(page);

      if (matchedItems.length === 0 && page === 1) {
        setError("No items found for this search");
        setTimeout(() => {
          clearSearch();
        }, 3000);
      } else {
        setError(null);
      }
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
}, [API_BASE, fetchWithCache, limit]);

  // Optimized page range fetching with parallel requests and caching
  const fetchItemsForPageRange = useCallback(async (startPage, endPage) => {
    try {
      setLoading(true);
      setSearchProgress(`Fetching pages ${startPage} to ${endPage}...`);
      
      // Create batched requests (max 5 concurrent)
      const batchSize = 5;
      const allItems = [];
      
      for (let i = startPage; i <= endPage; i += batchSize) {
        const batchEnd = Math.min(i + batchSize - 1, endPage);
        const batchPromises = [];
        
        for (let p = i; p <= batchEnd; p++) {
          const cacheKey = `flat_page_${p}_${limit}`;
          const url = `${API_BASE}/carts/flat?page=${p}&limit=${limit}`;
          batchPromises.push(
            fetchWithCache(url, cacheKey).then(data => data?.items || [])
          );
        }
        
        const batchResults = await Promise.all(batchPromises);
        allItems.push(...batchResults.flat());
      }
      
      setSearchProgress("");
      return allItems;
    } catch (err) {
      setError(`Failed to fetch items: ${err.message}`);
      setSearchProgress("");
      return [];
    } finally {
      setLoading(false);
    }
  }, [API_BASE, fetchWithCache, limit]);

// Updated the handleSearch function
const handleSearch = useCallback(() => {
  if (searchQuery.length >= 3 || startDate) {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before or equal to end date");
      return;
    }
    setSearchActive(true);
    setShowSuggestions(false);
    setSearchPage(1); // Reset to first page
    searchItems({ query: searchQuery, startDate, endDate, page: 1 });
  } else {
    setError("Search query must be 3+ characters, or select a date");
  }
}, [searchQuery, startDate, endDate, searchItems]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  }, [fetchSuggestions]);

  const handleSuggestionClick = useCallback((e, suggestion) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set searchQuery to SKU for products or value for names
    const queryValue = suggestion.type === 'product' ? suggestion.sku : suggestion.value;
    console.log("Selected suggestion:", suggestion, "Query value:", queryValue); // Debug log
    setSearchQuery(queryValue);
    setShowSuggestions(false);
  }, []);

// Updated the clearSearch function
const clearSearch = useCallback(() => {
  setSearchQuery("");
  setStartDate("");
  setEndDate("");
  setSearchActive(false);
  setPage(1);
  setSearchPage(1);
  setSearchTotalPages(1);
  setSearchProgress("");
  setError(null);
  setSuggestions([]);
  setShowSuggestions(false);
}, []);

  const nextPage = useCallback(() => page < totalPages && setPage(page + 1), [page, totalPages]);
  const prevPage = useCallback(() => page > 1 && setPage(page - 1), [page]);

  // Added search pagination functions
const nextSearchPage = useCallback(() => {
  if (searchPage < searchTotalPages) {
    const newPage = searchPage + 1;
    searchItems({ query: searchQuery, startDate, endDate, page: newPage });
  }
}, [searchPage, searchTotalPages, searchItems, searchQuery, startDate, endDate]);

const prevSearchPage = useCallback(() => {
  if (searchPage > 1) {
    const newPage = searchPage - 1;
    searchItems({ query: searchQuery, startDate, endDate, page: newPage });
  }
}, [searchPage, searchItems, searchQuery, startDate, endDate]);

  // Optimized CSV conversion with better memory usage
  const convertToCSV = useCallback((data) => {
    if (!data || data.length === 0) return '';
    
    const headers = [
      "User Name",
      "User Role", 
      "Product Name",
      "Product Subcategory",
      "Quantity",
      "SKU",
      "Image",
      "Date & Time"
    ];

    const csvRows = [headers.join(',')];
    
    for (const item of data) {
      const row = [
        `"${item.user?.name || "N/A"}"`,
        `"${item.user?.role || "N/A"}"`,
        `"${item.product?.productName || "N/A"}"`,
        `"${item.product?.productSubcategory || "N/A"}"`,
        `"${item.quantity || "N/A"}"`,
        `"${item.product?.sku || "N/A"}"`,
        `"${item.product?.Image || "No Image"}"`,
        `"${item.dateTime ? new Date(item.dateTime).toLocaleString() : "N/A"}"`
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }, []);

  const downloadCSV = useCallback((type = "current", start = page, end = page) => {
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
  }, [convertToCSV, fetchItemsForPageRange, items, page, searchActive, startPage, endPage, totalPages]);

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
              onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                    onMouseDown={(e) => handleSuggestionClick(e, suggestion)}
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
        {/* Updated the pagination section */}
{searchActive ? (
  // Search pagination
  <div className="flex justify-center items-center mt-6 space-x-4">
    <button
      onClick={prevSearchPage}
      disabled={searchPage === 1}
      className="px-4 py-2 bg-[#F47820] text-white rounded-lg disabled:bg-gray-300 hover:bg-[#73C049] transition-all"
    >
      Previous
    </button>
    <span className="text-gray-600">
      Page {searchPage} of {searchTotalPages}
    </span>
    <button
      onClick={nextSearchPage}
      disabled={searchPage === searchTotalPages}
      className="px-4 py-2 bg-[#F47820] text-white rounded-lg disabled:bg-gray-300 hover:bg-[#73C049] transition-all"
    >
      Next
    </button>
  </div>
) : (
  // Regular pagination
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