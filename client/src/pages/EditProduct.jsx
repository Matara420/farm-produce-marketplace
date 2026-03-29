import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AddProduct.css';

const EditProduct = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Vegetables',
    stock: '',
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') {
      navigate('/dashboard');
      return;
    }

    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const product = response.data;
        if (product.farmer_id !== currentUser.id) {
          navigate('/my-products');
          return;
        }

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          stock: product.stock.toString(),
          image: product.image,
        });
        setPreview(product.image);
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Product not found or you do not have permission to edit it.');
        navigate('/my-products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [currentUser, id, navigate]);

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
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/products/${id}`, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Product updated successfully!');
      navigate('/my-products');
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update product. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser || currentUser.role !== 'farmer') {
    return null;
  }

  if (loading) {
    return (
      <div className="add-product-page">
        <div className="add-product-container">
          <div className="loading">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <h1>Edit Product</h1>

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
                placeholder="e.g., Fresh Tomatoes"
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
                <p>Product Preview</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/my-products')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={saving}
            >
              {saving ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
