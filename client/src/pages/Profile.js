import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    profilePicture: null
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentUser?.profilePicture || null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      if (editForm.profilePicture) {
        formData.append('profile_picture', editForm.profilePicture);
      }

      const response = await axios.put('/users/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      updateUser(response.data);
      setShowEditModal(false);
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put('/users/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showMessage('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        showMessage('Please select a valid image file (JPEG, PNG, GIF)', 'error');
        return;
      }

      if (file.size > maxSize) {
        showMessage('Image size should be less than 5MB', 'error');
        return;
      }

      setEditForm(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getRoleStats = () => {
    const baseStats = {
      orders: currentUser.role === 'buyer' ? 12 : 0,
      reviews: currentUser.role === 'buyer' ? 8 : 0,
      favorites: currentUser.role === 'buyer' ? 5 : 0,
      listings: currentUser.role === 'seller' ? 15 : 0,
      sales: currentUser.role === 'seller' ? 42 : 0,
      rating: currentUser.role === 'seller' ? '4.8' : '0'
    };
    return baseStats;
  };

  if (!currentUser) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const stats = getRoleStats();

  return (
    <div className="profile-page">
      {/* Message Toast */}
      {message.text && (
        <div className={`message-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>

        <div className="profile-card">
          <div className="profile-main">
            <div className="profile-avatar-section">
              <div className="profile-picture-container">
                <img
                  src={currentUser?.profilePicture ? 
                    (currentUser.profilePicture.startsWith('http') ? 
                      currentUser.profilePicture : 
                      `http://localhost:3000${currentUser.profilePicture}`) : 
                    '/default-avatar.png'}
                  alt="Profile"
                  className="profile-picture"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div className="profile-status"></div>
              </div>
              <div className="profile-badges">
                <span className={`role-badge ${currentUser.role}`}>
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </span>
                <span className="status-badge">Active</span>
              </div>
            </div>

            <div className="profile-info">
              <h2>{currentUser.name}</h2>
              <p className="profile-email">{currentUser.email}</p>
              <div className="profile-meta">
                <span className="meta-item">
                  <i className="icon-calendar"></i>
                  Member since {new Date(currentUser.created_at || Date.now()).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="meta-item">
                  <i className="icon-shield"></i>
                  Account verified
                </span>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            {currentUser.role === 'buyer' ? (
              <>
                <div className="stat-card">
                  <div className="stat-icon orders"></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.orders}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon reviews"></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.reviews}</div>
                    <div className="stat-label">Reviews</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon favorites"></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.favorites}</div>
                    <div className="stat-label">Favorites</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card">
                  <div className="stat-icon listings"></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.listings}</div>
                    <div className="stat-label">Active Listings</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon sales"></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.sales}</div>
                    <div className="stat-label">Total Sales</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon rating"></div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.rating}</div>
                    <div className="stat-label">Seller Rating</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowEditModal(true)}
            >
              <i className="icon-edit"></i>
              Edit Profile
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              <i className="icon-lock"></i>
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditProfile} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="profilePicture" className="file-label">
                    <i className="icon-upload"></i>
                    Choose Image
                  </label>
                </div>
                {preview && (
                  <div className="image-preview">
                    <img src={preview} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => {
                        setPreview(null);
                        setEditForm(prev => ({ ...prev, profilePicture: null }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="file-hint">Max file size: 5MB. Supported formats: JPG, PNG, GIF</div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="modal-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  required
                  minLength="6"
                />
                <div className="password-hint">Must be at least 6 characters long</div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  required
                  minLength="6"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;