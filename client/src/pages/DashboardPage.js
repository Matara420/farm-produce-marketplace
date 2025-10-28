import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { currentUser, addOrder } = useAuth();
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Vegetables',
    stock: '',
    image: '',
    imageUrl: ''
  });

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        description: newProduct.description || '',
        image: newProduct.image || newProduct.imageUrl || ''
      };

      const response = await axios.post('/products', productData);

      if (response.status === 201) {
        alert('Product added successfully!');
        // Reset form
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: 'Vegetables',
          stock: '',
          image: '',
          imageUrl: ''
        });
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct({ 
          ...newProduct, 
          image: e.target.result, 
          imageUrl: '' 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    setNewProduct({ 
      ...newProduct, 
      image: e.target.value, 
      imageUrl: e.target.value 
    });
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]').filter(order => order.userId === currentUser.id);
  const totalEarnings = orders.reduce((total, order) => {
    return total + order.total;
  }, 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Dashboard - {currentUser.role === 'farmer' ? 'Farmer' : 'Buyer'}</h1>

        {currentUser.role === 'farmer' ? (
          <div className="farmer-dashboard">
            <div className="dashboard-section">
              <h2>Add New Product</h2>
              <form onSubmit={handleProductSubmit} className="product-form">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price (KSh)"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
                <select name="category" value={newProduct.category} onChange={handleInputChange}>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock Quantity"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
                
                {/* Image Upload Section - FIXED */}
                <div className="image-upload-section">
                  <label>Product Image:</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {newProduct.image && typeof newProduct.image === 'string' && newProduct.image.startsWith('data:image') && (
                    <div className="image-preview">
                      <img src={newProduct.image} alt="Preview" className="preview-image" />
                      <p>Image preview</p>
                    </div>
                  )}
                  <p className="upload-note">Upload an image from your device</p>
                </div>
                
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="Or enter Image URL (optional)"
                  value={newProduct.imageUrl || ''}
                  onChange={handleImageUrlChange}
                />
                
                <button type="submit">Add Product</button>
              </form>
            </div>

            <div className="dashboard-section">
              <h2>Your Products</h2>
              <p>View and manage your products in the <button onClick={() => navigate('/my-products')} style={{color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>My Products</button> section.</p>
            </div>

            <div className="dashboard-section">
              <h2>Earnings & Orders</h2>
              <div className="earnings-stats">
                <div className="stat-card">
                  <h3>Total Earnings</h3>
                  <p className="earnings-amount">KSh {totalEarnings.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="orders-count">{orders.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Products Listed</h3>
                  <p className="products-count">{JSON.parse(localStorage.getItem('products') || '[]').filter(product => product.farmer_id === currentUser.id).length}</p>
                </div>
              </div>
              
              <div className="recent-orders">
                <h3>Recent Orders</h3>
                {orders.length === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  <div className="orders-list">
                    {orders.slice(-5).reverse().map(order => (
                      <div key={order.id} className="order-item-mini">
                        <span>Order #{order.id}</span>
                        <span>KSh {order.total.toFixed(2)}</span>
                        <span>{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="buyer-dashboard">
            <div className="dashboard-section">
              <h2>Order History</h2>
              {orders.length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                <div className="order-history">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{order.id}</h3>
                        <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                        <span className="order-status">{order.status}</span>
                      </div>
                      <div className="order-items">
                        {order.items.map(item => {
                          const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                          return (
                            <div key={item.id} className="order-item">
                              <img src={item.image} alt={item.name} className="order-item-image" />
                              <div className="order-item-info">
                                <h4>{item.name}</h4>
                                <p>{item.farmer}</p>
                                <p>Quantity: {item.quantity} × KSh {price.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="order-total">
                        <strong>Total: KSh {order.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Spending Summary</h2>
              <div className="spending-stats">
                <div className="stat-card">
                  <h3>Total Spent</h3>
                  <p className="spent-amount">KSh {totalEarnings.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="orders-count">{orders.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Favorite Category</h3>
                  <p className="favorite-category">
                    {orders.length > 0 ? 'Vegetables' : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="dashboard-actions">
                <button
                  className="action-btn primary"
                  onClick={() => navigate('/marketplace')}
                >
                  Shop Marketplace
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;