import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({ name: '', role: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/login', formData);
      const { success, role, name } = response.data;
      console.log(response.data);
      if (success) {
        localStorage.setItem('username', name); // Save username to localStorage
        localStorage.setItem('role', role); // Save username to localStorage
        if (role === 'admin') {
          navigate('/register');
        } else if (role === 'wasteImage') {
          navigate('/portal');
        } else {
          setErrorMessage('Invalid role');
        }
      } else {
        setErrorMessage('Invalid credentials');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4f8' }}>
      <div style={{ width: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', background: '#fff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '4px', background: '#007BFF', color: '#fff', border: 'none' }}>
            Login
          </button>
        </form>
        {errorMessage && <p style={{ marginTop: '15px', color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
