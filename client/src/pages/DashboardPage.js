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
    
    // Convert price and stock to numbers
    const productWithNumberPrice = {
      ...newProduct,
      price: typeof newProduct.price === 'string' ? parseFloat(newProduct.price) : newProduct.price,
      stock: typeof newProduct.stock === 'string' ? parseInt(newProduct.stock) : newProduct.stock
    };
    
    addProduct(productWithNumberPrice);
    console.log('New product:', productWithNumberPrice);
    
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

  const totalEarnings = orderHistory.reduce((total, order) => {
    return total + order.total;
  }, 0);

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
              <div className="earnings-stats">
                <div className="stat-card">
                  <h3>Total Earnings</h3>
                  <p className="earnings-amount">KSh {totalEarnings.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="orders-count">{orderHistory.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Products Listed</h3>
                  <p className="products-count">{userProducts.length}</p>
                </div>
              </div>
              
              <div className="recent-orders">
                <h3>Recent Orders</h3>
                {orderHistory.length === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  <div className="orders-list">
                    {orderHistory.slice(-5).reverse().map(order => (
                      <div key={order.id} className="order-item-mini">
                        <span>Order #{order.id}</span>
                        <span>KSh {order.total.toFixed(2)}</span>
                        <span>{order.date}</span>
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
                  <p className="orders-count">{orderHistory.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Favorite Category</h3>
                  <p className="favorite-category">
                    {orderHistory.length > 0 ? 'Vegetables' : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Profile Information</h2>
              <div className="profile-info">
                {user.profilePicture && (
                  <div className="profile-picture-container">
                    <img src={user.profilePicture} alt="Profile" className="profile-picture" />
                  </div>
                )}
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> <span className="role-badge">{user.role}</span></p>
                <p><strong>Member since:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;