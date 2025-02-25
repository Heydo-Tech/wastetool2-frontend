import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', role: '', password: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch the list of users
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://waste-tool.apnimandi.us/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


useEffect(()=>{
    if(localStorage.getItem("role")!=="admin"){
        navigate('/');
    }
})


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://waste-tool.apnimandi.us/api/register', formData);
      setSuccessMessage(response.data.message);
      setErrorMessage('');
      setFormData({ name: '', role: '', password: '' });
      fetchUsers(); // Refresh the user list after registration
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed');
      setSuccessMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f9f9f9', padding: '20px', minHeight: '100vh' }}>
      <div style={{ width: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', background: '#fff', marginBottom: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register New User</h2>
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
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Role:</label>
            <input
              type="text"
              name="role"
              value={formData.role}
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
          <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '4px', background: '#28a745', color: '#fff', border: 'none' }}>
            Register
          </button>
        </form>
        {successMessage && <p style={{ marginTop: '15px', color: 'green', textAlign: 'center' }}>{successMessage}</p>}
        {errorMessage && <p style={{ marginTop: '15px', color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
      </div>
      <div style={{ width: '600px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', background: '#fff', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>List of Users</h2>
        {users.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Name</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td style={{ borderBottom: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{user.name}</td>
                  <td style={{ borderBottom: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
