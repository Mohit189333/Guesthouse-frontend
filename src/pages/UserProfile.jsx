import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Profile.css';
import Layout from '../components/Layout';
import { toast, ToastContainer } from 'react-toastify';

const UserProfile = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser({
        ...response.data,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to fetch profile data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user.password && user.password !== user.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const updateData = {
        username: user.username,
        email: user.email,
        ...(user.password && { password: user.password })
      };

      await axios.put('http://localhost:5050/api/users/me', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Layout>
    <div className="profile-container">
      <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
      <h2>My Profile</h2>
      {message && <div className="alert">{message}</div>}

      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-field">
            <label>Username:</label>
            <p>{user.username}</p>
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <p>{user.email}</p>
          </div>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password (leave blank to keep current):</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
    </Layout>
  );
};

export default UserProfile;