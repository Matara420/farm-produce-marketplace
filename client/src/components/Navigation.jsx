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
    <nav className={`sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-green-500/95 to-green-600/95 border-b border-white/10 shadow-lg ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Menu Button for Sidebar */}
        <button 
          className="bg-white/15 border border-white/20 text-white p-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 hover:scale-105 hover:shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link to={currentUser ? "/marketplace" : "/"} className="flex items-center gap-2 text-white font-bold text-lg hover:scale-105 transition-transform duration-200">
          <Leaf size={24} />
          <span className="hidden sm:block">Farm Marketplace</span>
        </Link>
        
        {/* Cart Button (for buyers) */}
        {currentUser?.role === 'buyer' && (
          <button 
            className="relative bg-white/15 border border-white/20 text-white px-4 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 hover:scale-105 hover:shadow-lg flex items-center gap-2" 
            onClick={() => setIsCartOpen(true)}
            title="Shopping Cart"
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{cartItemCount}</span>
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