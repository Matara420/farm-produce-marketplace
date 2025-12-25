import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ReviewForm from './ReviewForm';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const handleAddToCart = () => {
    addToCart({...product, price: price});
  };

  const handleRating = (newRating) => {
    setUserRating(newRating);
    // In real app, this would submit to backend
    console.log(`Rated product ${product.id} with ${newRating} stars`);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setUserRating(0); // Reset for demo
  };

  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.name} 
        className="product-image" 
        loading="lazy"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-farmer">{product.farmer}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-details">
          <span className="product-price">KSh {price.toFixed(2)}</span>
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
                role="button"
                tabIndex={0}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">
            {userRating ? `You rated: ${userRating}/5` : `Rate this product`}
          </span>
        </div>

        {currentUser && currentUser.role === 'buyer' && (
          <>
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button
              className="review-btn"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancel Review' : 'Write Review'}
            </button>
          </>
        )}

        {showReviewForm && (
          <ReviewForm
            productId={product.id}
            farmerId={product.farmer_id}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default ProductCard;