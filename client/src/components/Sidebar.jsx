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
// Removed CSS import - using pure Tailwind

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
    <div className="fixed inset-0 bg-black/50 z-[9999]" onClick={onClose}>
      <div className="fixed top-0 left-0 w-64 bg-white h-full shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
            <span>{currentUser?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm">Hello, {currentUser?.name}</div>
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs capitalize">{currentUser?.role}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-2 bg-white">
          <Link 
            to="/marketplace" 
            className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
              location.pathname === '/marketplace' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
            }`}
            onClick={onClose}
          >
            <Home size={18} />
            <span className="text-sm">Marketplace</span>
          </Link>

          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
              location.pathname === '/dashboard' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
            }`}
            onClick={onClose}
          >
            <BarChart3 size={18} />
            <span className="text-sm">Dashboard</span>
          </Link>

          {/* Farmer-specific links */}
          {currentUser?.role === 'farmer' && (
            <>
              <Link 
                to="/add-product" 
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
                  location.pathname === '/add-product' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
                }`}
                onClick={onClose}
              >
                <PlusCircle size={18} />
                <span className="text-sm">Add Product</span>
              </Link>

              <Link 
                to="/my-products" 
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
                  location.pathname === '/my-products' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
                }`}
                onClick={onClose}
              >
                <Package size={18} />
                <span className="text-sm">My Products</span>
              </Link>

              <Link 
                to="/messages" 
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
                  location.pathname === '/messages' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
                }`}
                onClick={onClose}
              >
                <History size={18} />
                <span className="text-sm">Messages</span>
              </Link>
            </>
          )}

          {/* Buyer-specific links */}
          {currentUser?.role === 'buyer' && (
            <>
              <Link 
                to="/orders" 
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
                  location.pathname === '/orders' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
                }`}
                onClick={onClose}
              >
                <ShoppingCart size={18} />
                <span className="text-sm">My Orders</span>
              </Link>

              <Link 
                to="/order-history" 
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
                  location.pathname === '/order-history' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
                }`}
                onClick={onClose}
              >
                <History size={18} />
                <span className="text-sm">Order History</span>
              </Link>
            </>
          )}

          <Link 
            to="/profile" 
            className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors ${
              location.pathname === '/profile' ? 'bg-green-50 text-green-700 border-r-2 border-green-500' : ''
            }`}
            onClick={onClose}
          >
            <User size={18} />
            <span className="text-sm">Profile</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 hover:bg-gray-100 rounded transition-colors"
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button 
            className="flex items-center gap-3 px-3 py-2 w-full text-red-600 hover:bg-red-50 rounded transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;