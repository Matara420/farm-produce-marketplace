import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

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
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
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
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>My Profile</h1>
        <div className="dashboard-section profile-section">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-picture-container">
                <img
                  src={
                    currentUser?.profilePicture 
                      ? (currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `http://localhost:5000${currentUser.profilePicture}`)
                      : currentUser?.profile_picture
                      ? (currentUser.profile_picture.startsWith('http') ? currentUser.profile_picture : `http://localhost:5000${currentUser.profile_picture}`)
                      : '/placeholder-avatar.png'
                  }
                  alt="Profile"
                  className="profile-picture"
                  onError={(e) => {
                    e.target.src = '/placeholder-avatar.png';
                  }}
                />
              </div>
              <div className="profile-role-badge">
                <span className="role-badge">{currentUser.role}</span>
              </div>
            </div>
            <div className="profile-details">
              <h2>{currentUser.name}</h2>
              <p className="profile-email">{currentUser.email}</p>
              <p className="profile-member-since">
                Member since {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{currentUser.role === 'buyer' ? '12' : '0'}</div>
              <div className="stat-label">Orders</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{currentUser.role === 'buyer' ? '8' : '0'}</div>
              <div className="stat-label">Reviews</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{currentUser.role === 'buyer' ? '5' : '0'}</div>
              <div className="stat-label">Favorites</div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="action-btn primary"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
            <button
              className="action-btn secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditProfile}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture</label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {preview && (
                  <div className="image-preview">
                    <img src={preview} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button
                className="close-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
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
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength="6"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
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