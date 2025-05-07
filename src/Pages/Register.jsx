import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    password: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://waste-tool.apnimandi.us/api/users"
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (user?.role !== import.meta.env.VITE_ADMIN_ROLE) {
      navigate("/");
    }
    fetchUsers();
  }, [navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://waste-tool.apnimandi.us/api/register",
        formData
      );
      setSuccessMessage(response.data.message);
      setErrorMessage("");
      setFormData({ name: "", role: "", password: "" });
      fetchUsers();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Registration failed");
      setSuccessMessage("");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      window.location.href = import.meta.env.VITE_SSO_LOGIN_URL;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <img
              src="favicon.png"
              alt="Apni Mandi Logo"
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-center text-[#1A3C34] mb-6">
            Register New User
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A3C34]">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-[#A8CABA] rounded-lg focus:ring-[#F4C430] focus:border-[#F4C430]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A3C34]">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role} // Fixed: Use formData.role, not formData.name
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-[#A8CABA] rounded-lg focus:ring-[#F4C430] focus:border-[#F4C430]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A3C34]">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-[#A8CABA] rounded-lg focus:ring-[#F4C430] focus:border-[#F4C430]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-[#73C049] hover:shadow-[#F4C430]/50 transition-all"
            >
              Register
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 mt-4 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-800 transition-all"
            >
              Logout
            </button>
          </form>
          {successMessage && (
            <p className="mt-4 text-center text-green-500">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="mt-4 text-center text-red-500">{errorMessage}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#1A3C34] text-center mb-6">
            List of Users
          </h2>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-green-100">
                    <th className="px-4 py-2 text-[#1A3C34] font-semibold">
                      Name
                    </th>
                    <th className="px-4 py-2 text-[#1A3C34] font-semibold">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-[#A8CABA]/20 transition-colors"
                    >
                      <td className="px-4 py-2 text-[#1A3C34]">{user.name}</td>
                      <td className="px-4 py-2 text-[#1A3C34]">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-[#1A3C34]">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
