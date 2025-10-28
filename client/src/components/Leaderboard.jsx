import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const Leaderboard = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/leaderboard');
      setFarmers(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Mock data for demo
      setFarmers([
        { farmer_id: 1, name: 'Green Valley Farm', avg_rating: 4.8, order_count: 45 },
        { farmer_id: 2, name: 'Sunny Meadows', avg_rating: 4.6, order_count: 38 },
        { farmer_id: 3, name: 'Organic Harvest', avg_rating: 4.5, order_count: 32 },
        { farmer_id: 4, name: 'Fresh Fields', avg_rating: 4.3, order_count: 28 },
        { farmer_id: 5, name: 'Local Growers', avg_rating: 4.2, order_count: 25 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard">
      <h3>🏆 Top Farmers</h3>
      <div className="leaderboard-list">
        {farmers.map((farmer, index) => (
          <div key={farmer.farmer_id} className="leaderboard-item">
            <div className="leaderboard-rank">
              <span className={`rank-badge rank-${index + 1}`}>
                {index + 1}
              </span>
            </div>
            <div className="farmer-info">
              <h4>{farmer.name}</h4>
              <div className="farmer-stats">
                <span className="rating">⭐ {farmer.avg_rating}/5</span>
                <span className="orders">📦 {farmer.order_count} orders</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;