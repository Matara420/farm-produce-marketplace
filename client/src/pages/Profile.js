import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import EditProfile from '../components/EditProfile.js';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleEditProfile = () => {
    // navigate('/edit-profile');
    <EditProfile />;
    };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>My Profile</h1>

        <div className="profile-info">
          {currentUser.profilePicture && (
            <div className="profile-picture-container">
              <img src={currentUser.profilePicture} alt="Profile" className="profile-picture" />
            </div>
          )}
          <h2>{currentUser.name}</h2>
          <p className="email">{currentUser.email}</p>
          <p><strong>Role:</strong> <span className="role-badge">{currentUser.role}</span></p>
          <p><strong>Member since:</strong> {new Date().toLocaleDateString()}</p>
        </div>

        {/* Stats Section
        <div className="profile-stats">
          <div className="stat-card">
            {/* <FaCalendarCheck className="stat-icon" /> */}
            {/* <div>
              <h3>12</h3>
              <p>Sessions Booked</p>
            </div>
          </div> */}
          {/* <div className="stat-card">
            {/* <FaStar className="stat-icon" /> */}
            {/* <div>
              <h3>4.8</h3>
              <p>Average Rating</p>
            </div> */}
          {/* </div> 
        </div>  */}

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="btn edit-btn" onClick={handleEditProfile}>
            Edit Profile
          </button>
          <button className="btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
