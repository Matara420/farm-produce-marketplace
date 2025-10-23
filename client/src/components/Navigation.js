import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { Sun, Moon, ShoppingCart, User } from 'lucide-react';
import Cart from './Cart';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className={`navigation ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="nav-container">
        <Link to={user ? "/marketplace" : "/"} className="nav-logo">
          🌱 Farm Marketplace
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'buyer' && (
                <button 
                  className="cart-btn" 
                  onClick={() => setIsCartOpen(true)}
                  title="Shopping Cart"
                >
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </button>
              )}
              
              <div className="user-profile-section">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="nav-profile-picture"
                  />
                ) : (
                  <div className="profile-placeholder">
                    <User size={18} />
                  </div>
                )}
                <div className="user-info">
                  <span className="user-name">Hello, {user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>

              <Link to="/dashboard" className="nav-link dashboard-link">
                Dashboard
              </Link>
              
              <button 
                className="logout-btn" 
                onClick={logout}
                title="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link login-link">Login</Link>
              <Link to="/register" className="nav-link register-link">Sign Up</Link>
            </>
          )}
          
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navigation;