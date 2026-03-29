import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  // const [canReview, setCanReview] = useState(false);

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const handleAddToCart = () => {
    addToCart({...product, price: price});
  };

  const handleRating = (newRating) => {
    setUserRating(newRating);
    // Convert 1-5 scale to 1-10 for backend
    const backendRating = newRating * 2;
    console.log(`Rated product ${product.id} with ${newRating} stars (${backendRating}/10 for backend)`);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setUserRating(0); // Reset for demo
  };

  // // Check if user can review this product
  // useEffect(() => {
  //   const checkReviewEligibility = async () => {
  //     if (!currentUser || currentUser.role !== 'buyer') return;

  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.get('/orders', {
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });

  //       // Check if user has purchased this product
  //       const hasPurchased = response.data.some(order =>
  //         order.status === 'delivered' &&
  //         order.products.some(p => p.id === product.id)
  //       );

  //       setCanReview(hasPurchased);
  //     } catch (error) {
  //       console.error('Error checking review eligibility:', error);
  //       setCanReview(false);
  //     }
  //   };

  //   checkReviewEligibility();
  // }, [currentUser, product.id]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-xl hover:shadow-green-500/15 transition-all duration-300 hover:-translate-y-1 hover:scale-102 overflow-hidden border-0 max-w-xs">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-28 object-cover" 
        loading="lazy"
      />
      <div className="p-2.5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1.5">{product.name}</h3>
        <p className="text-xs text-gray-600 mb-1.5">
          Farmer: <span
            className="text-green-600 hover:text-green-700 cursor-pointer underline font-medium"
            onClick={() => navigate(`/farmer-profile/${product.farmer_id}`)}
          >
            {product.farmer}
          </span>
          {currentUser && currentUser.role === 'buyer' && currentUser.id !== product.farmer_id && (
            <button
              className="ml-1 text-blue-500 hover:text-blue-600 transition-colors text-xs"
              onClick={() => navigate(`/chat/${product.farmer_id}`)}
              title="Chat with farmer"
            >
              💬
            </button>
          )}
        </p>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-green-600">KSh {price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        </div>

        {/* Rating Section */}
        <div className="mb-2">
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm cursor-pointer transition-colors ${
                  star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
                onClick={() => handleRating(star)}
                role="button"
                tabIndex={0}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {userRating ? `You rated: ${userRating}/5` : `Rate this product`}
          </span>
        </div>

        {currentUser && currentUser.role === 'buyer' && (
          <>
            <button
              className={`w-full py-1.5 px-3 rounded-lg font-medium transition-all duration-300 mb-1.5 text-sm ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-500/30'
              }`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button
              className="w-full py-1.5 px-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30 text-sm"
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