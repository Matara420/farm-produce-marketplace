import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MessagesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [currentUser, navigate]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Messages</h1>
        <div className="dashboard-section">
          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>No messages yet</p>
              <p>Start chatting with buyers or farmers from the marketplace!</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  className="conversation-item"
                  onClick={() => handleChatClick(conversation.user.id)}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#333' }}>
                      {conversation.user.name}
                    </h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                      {conversation.last_message ? 
                        conversation.last_message.content.substring(0, 50) + '...' : 
                        'No messages yet'
                      }
                    </p>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>
                    {conversation.last_message && 
                      new Date(conversation.last_message.timestamp).toLocaleDateString()
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;