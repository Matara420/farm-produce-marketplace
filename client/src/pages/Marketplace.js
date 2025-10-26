import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">
        <h1>Marketplace</h1>
        <p>Browse and shop for fresh farm produce</p>
        <div className="marketplace-content">
          <p>Marketplace features coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;