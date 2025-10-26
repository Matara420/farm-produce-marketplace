import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'farmer') {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Farmer Dashboard</h1>
        <div className="dashboard-section">
          <h2>Welcome, {currentUser.name}!</h2>
          <p>Manage your farm products and view orders from buyers.</p>
          <div className="dashboard-actions">
            <button 
              onClick={() => navigate('/add-product')}
              className="action-btn primary"
            >
              Add New Product
            </button>
            <button 
              onClick={() => navigate('/my-products')}
              className="action-btn secondary"
            >
              View My Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;