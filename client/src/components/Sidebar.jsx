import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  ShoppingCart, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  BarChart3,
  Package,
  PlusCircle,
  History
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  const profilePicture = currentUser?.profilePicture || currentUser?.profile_picture;

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        {/* User Profile Section */}
        <div className="sidebar-user-section">
          <div className="sidebar-profile-pic">
            {profilePicture ? (
              <img 
                src={profilePicture.startsWith('http') ? profilePicture : `http://localhost:5000${profilePicture}`}
                alt={currentUser.name}
                className="sidebar-profile-pic"
                onError={(e) => {
                  e.target.src = '/placeholder-avatar.png';
                }}
              />
            ) : (
              <div className="sidebar-profile-placeholder">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser?.name}</div>
            <div className="sidebar-user-role">{currentUser?.role}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <Link 
            to="/marketplace" 
            className={`sidebar-link ${location.pathname === '/marketplace' ? 'active' : ''}`}
            onClick={onClose}
          >
            <Home size={18} />
            <span>Marketplace</span>
          </Link>

          <Link 
            to="/dashboard" 
            className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={onClose}
          >
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </Link>

          {/* Farmer-specific links */}
          {currentUser?.role === 'farmer' && (
            <>
              <Link 
                to="/add-product" 
                className={`sidebar-link ${location.pathname === '/add-product' ? 'active' : ''}`}
                onClick={onClose}
              >
                <PlusCircle size={18} />
                <span>Add Product</span>
              </Link>

              <Link 
                to="/my-products" 
                className={`sidebar-link ${location.pathname === '/my-products' ? 'active' : ''}`}
                onClick={onClose}
              >
                <Package size={18} />
                <span>My Products</span>
              </Link>

              <Link 
                to="/messages" 
                className={`sidebar-link ${location.pathname === '/messages' ? 'active' : ''}`}
                onClick={onClose}
              >
                <History size={18} />
                <span>Messages</span>
              </Link>
            </>
          )}

          {/* Buyer-specific links */}
          {currentUser?.role === 'buyer' && (
            <>
              <Link 
                to="/orders" 
                className={`sidebar-link ${location.pathname === '/orders' ? 'active' : ''}`}
                onClick={onClose}
              >
                <ShoppingCart size={18} />
                <span>My Orders</span>
              </Link>

              <Link 
                to="/order-history" 
                className={`sidebar-link ${location.pathname === '/order-history' ? 'active' : ''}`}
                onClick={onClose}
              >
                <History size={18} />
                <span>Order History</span>
              </Link>
            </>
          )}

          <Link 
            to="/profile" 
            className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-actions">
          <button 
            className="sidebar-action-btn"
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button 
            className="sidebar-action-btn logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;