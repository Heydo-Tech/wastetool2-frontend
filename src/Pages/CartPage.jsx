import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:9004/cart/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        const data = await response.json();
        setCart(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId, navigate]);

  if (loading) {
    return (
      <p className="text-center text-gray-600 text-lg mt-16">Loading cart...</p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 text-lg mt-16">Error: {error}</p>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <p className="text-center text-gray-600 text-lg mt-16">
        Your cart is empty.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Your Cart
        </h1>
        <div className="space-y-6">
          {cart.items.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <img
                src={item.product.Image}
                alt={item.product.productName}
                className="w-24 h-24 object-cover rounded-md mr-6"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">
                  {item.product.productName}
                </h3>
                <p className="text-gray-600">
                  Subcategory: {item.product.productSubcategory}
                </p>
                <p className="text-gray-600">SKU: {item.product.sku}</p>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-gray-600">Price: ${item.product.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Cart Summary
          </h2>
          <div className="space-y-2">
            <p className="text-lg text-gray-600">
              Total Items:{" "}
              {cart.items.reduce((total, item) => total + item.quantity, 0)}
            </p>
            <p className="text-lg text-gray-600">
              Total Price: $
              {cart.items
                .reduce(
                  (total, item) => total + item.product.price * item.quantity,
                  0
                )
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
