import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [currentUser, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Filter for delivered and confirmed orders (confirmed orders are completed transactions)
      const completedOrders = response.data.filter(order => order.status === 'delivered' || order.status === 'confirmed');
      setOrders(completedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="dashboard-container">
          <div className="loading">Loading order history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="dashboard-container">
        <h1>Order History</h1>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <h3>No completed orders yet</h3>
              <p>Your confirmed orders (successful transactions) will appear here.</p>
              <button
                className="shop-btn"
                onClick={() => navigate('/marketplace')}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      {order.status === 'delivered' ? 'Delivered on' : 'Confirmed on'} {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status === 'delivered' ? 'delivered' : 'confirmed'}`}>
                      {order.status === 'delivered' ? 'Delivered' : 'Confirmed'}
                    </span>
                  </div>
                </div>

                <div className="order-products">
                  {order.products.map(product => (
                    <div key={product.id} className="order-product">
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p>Quantity: {product.quantity}</p>
                        <p className="product-price">KSh {product.price.toLocaleString()}</p>
                      </div>
                      <div className="product-total">
                        KSh {(product.price * product.quantity).toLocaleString()}
                      </div>
                      <div className="product-actions">
                        <button
                          className="review-btn"
                          onClick={() => navigate(`/marketplace?product=${product.id}&review=true`)}
                        >
                          Review {product.name}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: KSh {order.total_amount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
