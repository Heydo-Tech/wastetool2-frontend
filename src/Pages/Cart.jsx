import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "../Components/NavBar";

function Cart() {
  const [cart, setCart] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // New loading state
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((product) => product._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.info("Item removed from cart!", {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: true,
      style: { backgroundColor: "#F47820", color: "#FFFFFF" },
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((product) =>
      product._id === productId
        ? { ...product, quantity: newQuantity }
        : product
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Quantity updated!", {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: true,
      style: { backgroundColor: "#73C049", color: "#FFFFFF" },
    });
  };

  const saveCartToBackend = async () => {
    if (!userId) {
      toast.warn("User not logged in!", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        style: { backgroundColor: "#F47820", color: "#FFFFFF" },
      });
      return;
    }

    setIsSaving(true); // Disable button

    const cartData = cart.map((product) => ({
      productId: product._id,
      quantity: product.quantity,
    }));

    try {
      const response = await fetch("https://waste-tool.apnimandi.us/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          items: cartData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save cart");
      }

      toast.success("Cart saved successfully!", {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        style: { backgroundColor: "#73C049", color: "#FFFFFF" },
      });
      localStorage.removeItem("cart");
      navigate("/portal");
    } catch (error) {
      console.error("Error saving cart:", error);
      toast.error(`Error: ${error.message}`, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        style: { backgroundColor: "#F47820", color: "#FFFFFF" },
      });
    } finally {
      setIsSaving(false); // Re-enable button
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Shopping Cart
        </h1>
        {cart.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-6">
            {cart.map((product) => (
              <div
                key={product._id}
                className="flex items-center bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.Image}
                  alt={product.productName}
                  className="w-24 h-24 object-cover rounded-md mr-6"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {product.productName}
                  </h3>
                  <p className="text-gray-600">
                    Subcategory: {product.productSubcategory}
                  </p>
                  <p className="text-gray-600">SKU: {product.sku}</p>
                  <div className="flex items-center mt-2">
                    <button
                      className="px-3 py-1 bg-[#F47820] text-white rounded-l-md hover:bg-[#73C049]"
                      onClick={() =>
                        updateQuantity(product._id, product.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span className="px-4">{product.quantity}</span>
                    <button
                      className="px-3 py-1 bg-[#F47820] text-white rounded-r-md hover:bg-[#73C049]"
                      onClick={() =>
                        updateQuantity(product._id, product.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={() => removeFromCart(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-8">
          <button
            className={`px-6 py-3 bg-[#F47820] text-white font-semibold rounded-lg hover:bg-[#73C049] transition-all ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={saveCartToBackend}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Cart"}
          </button>
          <button
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
            onClick={() => navigate("/portal")}
          >
            Back to Products
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;