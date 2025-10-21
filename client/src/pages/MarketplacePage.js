import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductFilters from '../components/ProductFilters';
import ProductCard from '../components/ProductCard';
import { mockProducts } from '../data/mockProducts';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const { user, userProducts } = useAuth();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Combine mock products with user-added products
    let filtered = [...mockProducts, ...userProducts];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [user, navigate, selectedCategory, searchTerm, userProducts]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">
        <h1>Farm Fresh Products</h1>
        <ProductFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-products">No products found matching your criteria.</p>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
