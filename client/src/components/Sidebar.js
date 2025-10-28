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

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        {/* User Profile Section */}
        <div className="sidebar-user-section">
          {currentUser?.profilePicture ? (
            <img
              src={currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `http://localhost:5000${currentUser.profilePicture}`}
              alt="Profile"
              className="sidebar-profile-pic"
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {!currentUser?.profilePicture && (
            <div className="sidebar-profile-placeholder">
              <span>{currentUser?.name?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Hello, {currentUser?.name}</span>
            <span className="sidebar-user-role">{currentUser?.role}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <Link 
            to="/marketplace" 
            className={`sidebar-link ${location.pathname === '/marketplace' ? 'active' : ''}`}
            onClick={onClose}
          >
            <Home size={20} />
            <span>Marketplace</span>
          </Link>

          <Link 
            to="/dashboard" 
            className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={onClose}
          >
            <BarChart3 size={20} />
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
                <PlusCircle size={20} />
                <span>Add Product</span>
              </Link>

              <Link 
                to="/my-products" 
                className={`sidebar-link ${location.pathname === '/my-products' ? 'active' : ''}`}
                onClick={onClose}
              >
                <Package size={20} />
                <span>My Products</span>
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
                <ShoppingCart size={20} />
                <span>My Orders</span>
              </Link>

              <Link 
                to="/order-history" 
                className={`sidebar-link ${location.pathname === '/order-history' ? 'active' : ''}`}
                onClick={onClose}
              >
                <History size={20} />
                <span>Order History</span>
              </Link>
            </>
          )}

          <Link 
            to="/profile" 
            className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Bottom Actions - FIX 3 & 4: Added logout and theme toggle */}
        <div className="sidebar-actions">
          <button 
            className="sidebar-action-btn"
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button 
            className="sidebar-action-btn logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;