import React from 'react';
import { categories } from '../data/mockProducts';
import './ProductFilters.css';

const ProductFilters = ({ selectedCategory, onCategoryChange, searchTerm, onSearchChange }) => {
  return (
    <div className="product-filters">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
