import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ReviewForm.css';

const ReviewForm = ({ productId, farmerId, onReviewSubmitted }) => {
  const { currentUser } = useAuth();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredScore, setHoveredScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!score) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/ratings', {
        farmer_id: farmerId,
        product_id: productId,
        score: score * 2, // Convert 1-5 to 1-10 scale
        comment
      });
      
      alert('Review submitted successfully!');
      setScore(0);
      setComment('');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form">
      <h4>Write a Review</h4>
      <form onSubmit={handleSubmit}>
        <div className="rating-section">
          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoveredScore || score) ? 'active' : ''}`}
                onClick={() => setScore(star)}
                onMouseEnter={() => setHoveredScore(star)}
                onMouseLeave={() => setHoveredScore(0)}
              >
                ★
              </button>
            ))}
          </div>
          <span className="rating-text">
            {score ? `${score}/5 stars` : 'Select rating'}
          </span>
        </div>

        <div className="comment-section">
          <label htmlFor="comment">Comment (optional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={submitting || !score}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;