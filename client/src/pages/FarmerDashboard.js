import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FarmerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalRevenue: 0,
    totalOrders: 0,
    recentOrders: [],
    soldProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'farmer') {
      fetchFarmerStats();
    }
  }, [currentUser, fetchFarmerStats]);

  const fetchFarmerStats = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch farmer's products
      const productsResponse = await axios.get('/products', { headers });
      const farmerProducts = productsResponse.data.filter(
        product => product.farmer_id === currentUser.id
      );

      // Fetch farmer's orders
      const ordersResponse = await axios.get('/orders', { headers });
      const farmerOrders = ordersResponse.data.filter(order =>
        order.products && order.products.some(product =>
          farmerProducts.some(fp => fp.id === product.id)
        )
      );

      // Calculate stats
      const totalProducts = farmerProducts.length;
      const totalStock = farmerProducts.reduce((sum, product) => sum + product.stock, 0);
      const totalRevenue = farmerOrders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = farmerOrders.filter(order => order.status === 'delivered').length;

      // Get recent orders (last 5)
      const recentOrders = farmerOrders
        .filter(order => order.status === 'delivered')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Get sold products with quantities
      const soldProductsMap = new Map();
      farmerOrders
        .filter(order => order.status === 'delivered')
        .forEach(order => {
          order.products.forEach(product => {
            if (farmerProducts.some(fp => fp.id === product.id)) {
              const existing = soldProductsMap.get(product.id) || {
                id: product.id,
                name: product.name,
                image: product.image,
                totalSold: 0,
                totalRevenue: 0
              };
              existing.totalSold += product.quantity;
              existing.totalRevenue += product.price * product.quantity;
              soldProductsMap.set(product.id, existing);
            }
          });
        });

      const soldProducts = Array.from(soldProductsMap.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10); // Top 10 sold products

      setStats({
        totalProducts,
        totalStock,
        totalRevenue,
        totalOrders,
        recentOrders,
        soldProducts
      });
    } catch (error) {
      console.error('Error fetching farmer stats:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'farmer') {
    return null;
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Farmer Dashboard</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>Total Stock</h3>
            <p className="stat-number">{stats.totalStock}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">KSh {stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Orders Fulfilled</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Welcome, {currentUser.name}!</h2>
          <p>Manage your farm products and track your sales performance.</p>
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
              Manage Products
            </button>
          </div>
        </div>

        {/* Successfully Sold Products */}
        {stats.soldProducts.length > 0 && (
          <div className="dashboard-section">
            <h2>Successfully Sold Products</h2>
            <div className="sold-products-grid">
              {stats.soldProducts.map(product => (
                <div key={product.id} className="sold-product-card">
                  <div className="product-image">
                    <img
                      src={product.image || '/placeholder-product.png'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <div className="product-stats">
                      <span className="total-sold">Sold: {product.totalSold} units</span>
                      <span className="total-revenue">Revenue: KSh {product.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {stats.recentOrders.length > 0 && (
          <div className="dashboard-section">
            <h2>Recent Orders</h2>
            <div className="recent-orders">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-products">
                    {order.products.map(product => (
                      <div key={product.id} className="order-product">
                        <span>{product.name}</span>
                        <span>Qty: {product.quantity}</span>
                        <span>KSh {(product.price * product.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>Total: KSh {order.total_amount.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
