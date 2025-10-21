import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [userRating, setUserRating] = useState(0);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleRating = (newRating) => {
    setUserRating(newRating);
    // In a real app, this would send to backend
    console.log(`Rated product ${product.id} with ${newRating} stars`);
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-farmer">{product.farmer}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-details">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span className="product-stock">Stock: {product.stock}</span>
        </div>

        {/* Rating Section */}
        <div className="rating-section">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= userRating ? 'filled' : ''}`}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">
            {userRating ? `You rated: ${userRating}/5` : `Rating: 0/5`}
          </span>
        </div>

        {user && user.role === 'buyer' && (
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
