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
import MyProducts from './pages/MyProducts';
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
                <Route path="/my-products" element={<MyProducts />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;