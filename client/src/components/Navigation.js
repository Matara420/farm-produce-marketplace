import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { Sun, Moon, ShoppingCart } from 'lucide-react';
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
          Farm Marketplace
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'buyer' && (
                <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && <span>({cartItemCount})</span>}
                </button>
              )}
              <span className="user-info">Welcome, {user.name}</span>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Sign Up</Link>
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navigation;
