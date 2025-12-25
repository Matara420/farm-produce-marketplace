import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, ShoppingCart, Leaf } from 'lucide-react';
import Cart from './Cart';
import Sidebar from './Sidebar';
import './Navigation.css';

const Navigation = () => {
  const { currentUser } = useAuth();
  const { cart } = useCart();
  const { isDarkMode } = useTheme();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className={`navigation ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="nav-container">
        {/* Menu Button for Sidebar */}
        <button 
          className="menu-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to={currentUser ? "/marketplace" : "/"} className="nav-logo">
          <Leaf size={24} />
          <span>Farm Marketplace</span>
        </Link>
        
        {/* Cart Button (for buyers) */}
        {currentUser?.role === 'buyer' && (
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
      </div>
      
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navigation;