import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './FarmerProfile.css';

const FarmerProfile = () => {
  const { farmerId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmerProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/farmer/${farmerId}`);
        setFarmerData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load farmer profile');
        setLoading(false);
      }
    };

    fetchFarmerProfile();
  }, [farmerId]);

  const handleMessageFarmer = () => {
    if (currentUser && currentUser.role === 'buyer') {
      navigate(`/chat/${farmerId}`);
    }
  };

  if (loading) {
    return (
      <div className="farmer-profile">
        <div className="loading">Loading farmer profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="farmer-profile">
        <div className="error">{error}</div>
      </div>
    );
  }

  const { farmer, stats, products, ratings } = farmerData;

  return (
    <div className="farmer-profile">
      <div className="profile-header">
        <div className="farmer-info">
          <img
            src={
              farmer.profile_picture 
                ? (farmer.profile_picture.startsWith('http') ? farmer.profile_picture : `http://localhost:5000${farmer.profile_picture}`)
                : '/placeholder-avatar.png'
            }
            alt={farmer.name}
            className="farmer-avatar"
            onError={(e) => {
              e.target.src = '/placeholder-avatar.png';
            }}
          />
          <div className="farmer-details">
            <h1>{farmer.name}</h1>
            <p className="farmer-email">📧 {farmer.email}</p>
            {farmer.phone_number && <p className="farmer-phone">📱 {farmer.phone_number}</p>}
            <p className="farmer-joined">Joined: {new Date(farmer.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {currentUser && currentUser.role === 'buyer' && currentUser.id !== parseInt(farmerId) && (
          <button className="message-btn" onClick={handleMessageFarmer}>
            💬 Message Farmer
          </button>
        )}
      </div>

      <div className="stats-section">
        <h2>Farmer Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.products_sold}</h3>
            <p>Products Sold</p>
          </div>
          <div className="stat-card">
            <h3>{stats.products_on_market}</h3>
            <p>Products on Market</p>
          </div>
          <div className="stat-card">
            <h3>{stats.avg_rating}/5</h3>
            <p>Average Rating</p>
          </div>
          <div className="stat-card">
            <h3>{stats.total_ratings}</h3>
            <p>Total Reviews</p>
          </div>
        </div>
      </div>

      <div className="products-section">
        <h2>Products by {farmer.name}</h2>
        {products.length === 0 ? (
          <p className="no-products">No products available</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <p className="price">KSh {product.price.toFixed(2)}</p>
                  <p className="stock">Stock: {product.stock}</p>
                  <p className="description">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ratings-section">
        <h2>Customer Reviews</h2>
        {ratings.length === 0 ? (
          <p className="no-ratings">No reviews yet</p>
        ) : (
          <div className="ratings-list">
            {ratings.map(rating => (
              <div key={rating.id} className="rating-card">
                <div className="rating-header">
                  <span className="buyer-name">{rating.buyer_name}</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star ${star <= rating.score ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-date">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && <p className="rating-comment">{rating.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerProfile;
