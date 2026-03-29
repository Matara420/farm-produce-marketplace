import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Profile from './pages/Profile';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import MyProducts from './pages/MyProducts';
import OrdersPage from './pages/OrdersPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ChatPage from './pages/ChatPage';
import FarmerProfile from './pages/FarmerProfile';
import MessagesPage from './pages/MessagesPage';
import './App.css';

function DashboardRouter() {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return currentUser.role === 'farmer' ? 
    <FarmerDashboard /> : 
    <BuyerDashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Navigation />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/edit-product/:id" element={<EditProduct />} />
                <Route path="/my-products" element={<MyProducts />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order-history" element={<OrderHistoryPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/chat/:userId" element={<ChatPage />} />
                <Route path="/farmer-profile/:farmerId" element={<FarmerProfile />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;