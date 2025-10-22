import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, userProducts, orderHistory, addProduct } = useAuth();
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

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleProductSubmit = (e) => {
    e.preventDefault();
    // Add product to user's products
    addProduct(newProduct);
    console.log('New product:', newProduct);
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
    alert('Product added successfully!');
  };

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Dashboard - {user.role === 'farmer' ? 'Farmer' : 'Buyer'}</h1>

        {user.role === 'farmer' ? (
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
                  placeholder="Price ($)"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  step="0.01"
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
                  required
                />
                <div className="image-upload-section">
                  <label>Product Image:</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // In a real app, you'd upload to a server and get back a URL
                        // For demo purposes, we'll create a data URL
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setNewProduct({ ...newProduct, image: e.target.result, imageUrl: '' });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <p className="upload-note">Upload an image from your device</p>
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="Or enter Image URL (optional)"
                  value={newProduct.imageUrl || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value, imageUrl: e.target.value })}
                />
                <button type="submit">Add Product</button>
              </form>
            </div>

            <div className="dashboard-section">
              <h2>Your Products</h2>
              {userProducts.length === 0 ? (
                <p>No products added yet.</p>
              ) : (
                <div className="user-products-grid">
                  {userProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Earnings & Orders</h2>
              <p>Total earnings: $0.00</p>
              <p>Orders: 0</p>
            </div>
          </div>
        ) : (
          <div className="buyer-dashboard">
            <div className="dashboard-section">
              <h2>Order History</h2>
              {orderHistory.length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                <div className="order-history">
                  {orderHistory.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{order.id}</h3>
                        <span className="order-date">{order.date}</span>
                        <span className="order-status">{order.status}</span>
                      </div>
                      <div className="order-items">
                        {order.items.map(item => (
                          <div key={item.id} className="order-item">
                            <img src={item.image} alt={item.name} className="order-item-image" />
                            <div className="order-item-info">
                              <h4>{item.name}</h4>
                              <p>{item.farmer}</p>
                              <p>Quantity: {item.quantity} × ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="order-total">
                        <strong>Total: ${order.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Profile Information</h2>
              <div className="profile-info">
                {user.profilePicture && (
                  <div className="profile-picture-container">
                    <img src={user.profilePicture} alt="Profile" className="profile-picture" />
                  </div>
                )}
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
