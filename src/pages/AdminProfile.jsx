import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Profile.css';
import Layout from '../components/Layout';
import { adminProfileSchema } from '../validation/validationSchema';

const AdminProfile = () => {
  const [admin, setAdmin] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdmin({
        ...response.data,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Please log in again');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Zod validation
    const parseAdmin = {
      ...admin,
      password: admin.password || "",
      confirmPassword: admin.confirmPassword || ""
    };
    const validation = adminProfileSchema.safeParse(parseAdmin);
    if (!validation.success) {
      setMessage(validation.error.errors[0].message);
      return;
    }

    try {
      const updateData = {
        username: admin.username,
        email: admin.email,
        ...(admin.password && { password: admin.password })
      };

      await axios.put('http://localhost:5050/api/users/me', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchAdminProfile();
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      setMessage(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5050/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('User deleted successfully');
        fetchAllUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
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
        <h2>Admin Profile</h2>

        <div className="admin-content">
          <div className="admin-profile-section">
            {!isEditing ? (
              <div className="profile-view">
                <div className="profile-field">
                  <label>Username:</label>
                  <p>{admin.username}</p>
                </div>
                <div className="profile-field">
                  <label>Email:</label>
                  <p>{admin.email}</p>
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
                    value={admin.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={admin.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password (leave blank to keep current):</label>
                  <input
                    type="password"
                    name="password"
                    value={admin.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={admin.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
                {message && <div className="alert">{message}</div>}
              </form>
            )}
          </div>

          <div className="admin-users-section">
            <button 
              onClick={() => {
                setShowUsers(!showUsers);
                if (!showUsers) fetchAllUsers();
              }}
            >
              {showUsers ? 'Hide Users' : 'Manage Users'}
            </button>

            {showUsers && (
              <div className="users-list">
                <h3>User Management</h3>
                {users.length === 0 ? (
                  <p>No users found</p>
                ) : (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.roles?.[0] || 'USER'}</td>
                          <td>
                            <button 
                              className="delete-btn"
                              onClick={() => deleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProfile;