import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductFilters from '../components/ProductFilters';
import ProductCard from '../components/ProductCard';
import Leaderboard from '../components/Leaderboard';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [currentUser, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock data for demo
      const mockProducts = [
        {
          id: 1,
          name: 'Organic Tomatoes',
          price: 150,
          category: 'Vegetables',
          stock: 50,
          image: 'https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=Tomatoes',
          farmer: 'Green Valley Farm',
          description: 'Fresh, vine-ripened organic tomatoes'
        },
        // ... include other mock products from your data
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.farmer && product.farmer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">
        <h1>Farm Fresh Products</h1>
        
        <div className="marketplace-layout">
          <div className="main-content">
            <ProductFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <div className="products-grid">
                {filteredProducts.length === 0 ? (
                  <p className="no-products">No products found matching your criteria.</p>
                ) : (
                  filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="sidebar">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;