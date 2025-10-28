import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrdersPage.css';

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

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
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'delivered': return '#4caf50';
      default: return '#666';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending' || order.status === 'confirmed';
    if (activeTab === 'history') return order.status === 'delivered';
    return true;
  });

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="orders-page">
        <div className="dashboard-container">
          <div className="loading">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="dashboard-container">
        <h1>My Orders</h1>

        {/* Tab Navigation */}
        <div className="orders-tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Orders ({orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Order History ({orders.filter(o => o.status === 'delivered').length})
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <h3>No {activeTab === 'pending' ? 'pending' : 'completed'} orders</h3>
              <p>
                {activeTab === 'pending'
                  ? "Your pending orders will appear here once you place them. Orders are created after successful M-Pesa payment."
                  : "Your completed orders will appear here once they're delivered."
                }
              </p>
              {activeTab === 'pending' && (
                <button
                  className="shop-btn"
                  onClick={() => navigate('/marketplace')}
                >
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: KSh {order.total_amount.toLocaleString()}</strong>
                  </div>
                  {order.status === 'pending' && (
                    <div className="order-actions">
                      <button className="cancel-btn">Cancel Order</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
