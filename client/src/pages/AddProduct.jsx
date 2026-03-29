import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddProduct.css';

const AddProduct = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Vegetables',
    stock: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  if (!currentUser || currentUser.role !== 'farmer') {
    navigate('/dashboard');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setFormData(prev => ({ 
          ...prev, 
          image: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        description: formData.description,
        image: formData.image || 'https://via.placeholder.com/200x150/4CAF50/FFFFFF?text=Product'
      };

      const response = await axios.post('/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        alert('Product added successfully!');
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Vegetables',
          stock: '',
          image: '',
        });
        setPreview('');
        navigate('/my-products');
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add product. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <h1>Add New Product</h1>
        
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Organic Tomatoes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select 
                id="category" 
                name="category" 
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Meat">Meat</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (KSh) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                placeholder="150.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="1"
                required
                placeholder="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe your product..."
              rows="3"
            />
          </div>

          <div className="image-upload-section">
            <label>Product Image</label>
            <div className="image-options">
              <div className="upload-option">
                <label htmlFor="file-upload" className="upload-label">
                  Upload from device
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="upload-note">Supported: JPG, PNG, WebP</p>
              </div>
            </div>

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Product preview" />
                <p>Image Preview</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;