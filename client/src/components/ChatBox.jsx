import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ChatBox.css';

const ChatBox = ({ otherUserId, otherUserName, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/messages/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  useEffect(() => {
    fetchMessages();
    // Set up polling to keep messages updated
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !currentUser) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/messages', {
        receiver_id: otherUserId,
        content: newMessage.trim()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessages(prev => [...(prev || []), response.data]);
      setNewMessage('');
      // Don't clear messages - keep them persistent
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    // Adjust for East Africa Time (UTC+3)
    date.setHours(date.getHours() + 3);
    const now = new Date();
    now.setHours(now.getHours() + 3);
    const diff = now - date;

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="chat-box">
        <div className="chat-header">
          <h3>Chat with {otherUserName}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat with {otherUserName}</h3>
        <button onClick={onClose} className="close-btn" type="button">×</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.filter(message => message && message.id).map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender_id === currentUser?.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="send-btn"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
