import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './MyProducts.css';

const MyProducts = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') {
      navigate('/dashboard');
      return;
    }

    const fetchMyProducts = async () => {
      try {
        const response = await axios.get('/products');
        // Filter products to show only current farmer's products
        const myProducts = response.data.filter(
          product => product.farmer_id === currentUser.id
        );
        setProducts(myProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [currentUser, navigate]);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete product. Please try again.';
        alert(errorMessage);
      }
    }
  };

  if (!currentUser || currentUser.role !== 'farmer') {
    return null;
  }

  return (
    <div className="my-products-page">
      <div className="my-products-container">
        <div className="my-products-header">
          <h1>My Products</h1>
          <button 
            className="add-product-btn"
            onClick={() => navigate('/add-product')}
          >
            + Add New Product
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading your products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <h3>No products yet</h3>
            <p>Start by adding your first product to the marketplace!</p>
            <button 
              className="add-first-product-btn"
              onClick={() => navigate('/add-product')}
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            <div className="products-stats">
              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-number">{products.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Stock</h3>
                <p className="stat-number">
                  {products.reduce((total, product) => total + product.stock, 0)}
                </p>
              </div>
            </div>

            <div className="my-products-grid">
              {products.map(product => (
                <div key={product.id} className="product-item-with-controls">
                  <ProductCard product={product} />
                  <div className="product-controls">
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/edit-product/${product.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProducts;