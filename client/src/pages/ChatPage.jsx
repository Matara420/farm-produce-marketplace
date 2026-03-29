import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import axios from 'axios';
import './ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserDetails = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const userProduct = response.data.find(product => product.farmer_id === parseInt(userId));

      if (userProduct) {
        setOtherUser({
          id: parseInt(userId),
          name: userProduct.farmer || 'Unknown Farmer'
        });
      } else {
        setOtherUser({
          id: parseInt(userId),
          name: 'User'
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (parseInt(userId) === currentUser.id) {
      setError('You cannot chat with yourself');
      setLoading(false);
      return;
    }

    fetchUserDetails();
  }, [userId, currentUser, navigate, fetchUserDetails]);



  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="back-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="error-message">
            <h2>User Not Found</h2>
            <p>The user you're trying to chat with doesn't exist.</p>
            <button onClick={() => navigate(-1)} className="back-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatBox
          otherUserId={otherUser.id}
          otherUserName={otherUser.name}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default ChatPage;
