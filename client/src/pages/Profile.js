import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Profile</h1>
        <div className="dashboard-section">
          <div className="profile-info">
            {currentUser.profilePicture && (
              <div className="profile-picture-container">
                <img src={currentUser.profilePicture} alt="Profile" className="profile-picture" />
              </div>
            )}
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> <span className="role-badge">{currentUser.role}</span></p>
            <p><strong>Member since:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;