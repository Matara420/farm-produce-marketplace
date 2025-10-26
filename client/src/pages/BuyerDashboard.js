import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BuyerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'buyer') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'buyer') {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Buyer Dashboard</h1>
        <div className="dashboard-section">
          <h2>Welcome, {currentUser.name}!</h2>
          <p>Browse fresh farm products and manage your orders.</p>
          <div className="dashboard-actions">
            <button 
              onClick={() => navigate('/marketplace')}
              className="action-btn primary"
            >
              Shop Marketplace
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="action-btn secondary"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;