import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";

function WasteImages() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [showInput, setShowInput] = useState({});
  const navigate = useNavigate();
  const productRefs = useRef({}); // Store refs for each product card

  useEffect(() => {
    if (localStorage.getItem("role") !== "wasteImage") {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    console.log("useEffect: Fetching data and initializing cart");
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://waste-tool.apnimandi.us/api/api/products`
        );
        const sortedProducts = response.data.sort((a, b) => {
          const getSortName = (name) => {
            if (!name) return "";
            const lowerName = name.toLowerCase().trim();
            const prefixRegex = /^apni mandi\s+/i;
            return lowerName.replace(prefixRegex, "");
          };
          return getSortName(a.productName).localeCompare(getSortName(b.productName));
        });
        console.log("Sorted products:", sortedProducts.map(p => p.productName));
        setProducts(sortedProducts);
        setError(null);
      } catch (error) {
        setError(error.message || "Failed to fetch products");
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(existingCart);
    setCartCount(existingCart.reduce((acc, item) => acc + item.quantity, 0));
    const initialInputValues = {};
    existingCart.forEach(item => {
      initialInputValues[item._id] = String(item.quantity);
    });
    setInputValues(initialInputValues);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(productRefs.current).forEach((productId) => {
        const ref = productRefs.current[productId];
        if (ref && !ref.contains(event.target) && showInput[productId]) {
          console.log(`handleClickOutside: Resetting showInput for product ${productId}`);
          setShowInput(prev => ({
            ...prev,
            [productId]: false
          }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInput]);

  const showToast = (message, type = "success") => {
    console.log(`showToast: ${message}, Type: ${type}`);
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
      type === "success" ? "bg-[#73C049]" : "bg-[#F47820]"
    } opacity-90`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const updateCartQuantity = (product, newQuantity) => {
    if (newQuantity < 0) return;
    console.log("updateCartQuantity: Product:", product._id, "New Quantity:", newQuantity);

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    let updatedCart;

    if (newQuantity === 0) {
      updatedCart = existingCart.filter((item) => item._id !== product._id);
      showToast("Removed from cart!", "info");
    } else {
      const isProductInCart = existingCart.some(
        (item) => item._id === product._id
      );
      if (isProductInCart) {
        updatedCart = existingCart.map((item) =>
          item._id === product._id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        updatedCart = [...existingCart, { ...product, quantity: newQuantity }];
      }
      showToast("Updated cart!", "success");
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
    setInputValues(prev => ({
      ...prev,
      [product._id]: String(newQuantity)
    }));
  };

  const getCartQuantity = (productId) => {
    const productInCart = cart.find((item) => item._id === productId);
    return productInCart ? productInCart.quantity : 0;
  };

  const getDisplayName = (name) => {
    if (!name) {
      console.log("getDisplayName: Empty name");
      return "";
    }
    const lowerName = name.toLowerCase().trim();
    const prefixRegex = /^apni mandi\s+/i;
    const displayName = name.replace(prefixRegex, "").trim();
    console.log(`getDisplayName: Input: "${name}", Output: "${displayName}"`);
    return displayName;
  };

  const handleInputChange = (productId, value) => {
    console.log(`handleInputChange: Product: ${productId}, Value: "${value}"`);
    setInputValues(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleInputSubmit = (product) => {
    const inputValue = inputValues[product._id] || "";
    console.log(`handleInputSubmit: Product: ${product._id}, Input: "${inputValue}"`);
    const parsedValue = parseFloat(inputValue);
    if (inputValue === "") {
      updateCartQuantity(product, 0);
    } else if (!isNaN(parsedValue) && parsedValue >= 0) {
      updateCartQuantity(product, parsedValue);
    } else {
      setInputValues(prev => ({
        ...prev,
        [product._id]: String(getCartQuantity(product._id))
      }));
    }
  };

  const handleAddToCart = (product) => {
    const currentQuantity = getCartQuantity(product._id);
    setShowInput(prev => ({
      ...prev,
      [product._id]: true
    }));
    setInputValues(prev => ({
      ...prev,
      [product._id]: String(currentQuantity || 1)
    }));
    if (!currentQuantity) {
      updateCartQuantity(product, 1);
    }
  };

  console.log("Rendering WasteImages: products:", products.length, "cart:", cart.length, "showInput:", showInput);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#F47820] border-solid"></div>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#F47820] to-[#73C049] bg-clip-text text-transparent">
            Loading...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl border-l-4 border-gray-500">
          <p className="text-lg font-semibold text-gray-600">Error: {error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Product List
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#73C049] focus:border-[#73C049]"
              placeholder="Search by product name or subcategory"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter((product) => {
              const name = product.productName?.toLowerCase() || "";
              const subcategory =
                product.productSubcategory?.toLowerCase() || "";
              return (
                name.includes(searchQuery.toLowerCase()) ||
                subcategory.includes(searchQuery.toLowerCase())
              );
            })
            .map((product) => (
              <div
                key={product._id}
                ref={(el) => (productRefs.current[product._id] = el)} // Attach ref to product card
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <img
                  src={product.Image}
                  alt={getDisplayName(product.productName)}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {getDisplayName(product.productName)}
                  </h3>
                  <p className="text-gray-600">{product.productSubcategory}</p>
                  <p className="text-gray-600">SKU: {product.sku}</p>
                  <div className="flex justify-center gap-2 mt-4">
                    {showInput[product._id] ? (
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 bg-[#73C049] text-white rounded-lg hover:bg-[#5DA738] transition-all"
                          onClick={() =>
                            updateCartQuantity(
                              product,
                              Math.max(0, getCartQuantity(product._id) - 0.1)
                            )
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={inputValues[product._id] ?? getCartQuantity(product._id)}
                          onChange={(e) => handleInputChange(product._id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleInputSubmit(product);
                            }
                          }}
                          className="w-16 text-center text-lg font-semibold text-gray-800 border border-gray-300 rounded focus:ring-[#73C049] focus:border-[#73C049]"
                        />
                        <button
                          className="px-3 py-1 bg-[#73C049] text-white rounded-lg hover:bg-[#5DA738] transition-all"
                          onClick={() =>
                            updateCartQuantity(
                              product,
                              getCartQuantity(product._id) + 0.1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="px-4 py-2 bg-[#F47820] text-white rounded-lg hover:bg-[#73C049] transition-all"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="text-center mt-8">
          <button
            className="px-6 py-3 bg-[#F47820] text-white font-semibold rounded-lg hover:bg-[#73C049] transition-all"
            onClick={() => navigate("/cart")}
          >
            Go to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default WasteImages;