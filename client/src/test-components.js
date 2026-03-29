// Test script to verify component functionality
import React from 'react';
import ReactDOM from 'react-dom/client';

// Test if all components can be imported
try {
  console.log('🧪 Testing Component Imports...');
  
  // Import all components
  const Navigation = require('./components/Navigation.jsx').default;
  const Sidebar = require('./components/Sidebar.jsx').default;
  const ProductCard = require('./components/ProductCard.jsx').default;
  const Cart = require('./components/Cart.jsx').default;
  
  // Import all pages
  const Profile = require('./pages/Profile.jsx').default;
  const LandingPage = require('./pages/LandingPage.jsx').default;
  const Marketplace = require('./pages/Marketplace.jsx').default;
  
  // Import contexts
  const { AuthProvider } = require('./context/AuthContext.jsx');
  const { CartProvider } = require('./context/CartContext.jsx');
  const { ThemeProvider } = require('./context/ThemeContext.jsx');
  
  console.log('✅ All components imported successfully');
  
  // Test component structure
  console.log('🔍 Testing Component Structure...');
  
  const testComponents = [
    { name: 'Navigation', component: Navigation },
    { name: 'Sidebar', component: Sidebar },
    { name: 'ProductCard', component: ProductCard },
    { name: 'Cart', component: Cart },
    { name: 'Profile', component: Profile },
    { name: 'LandingPage', component: LandingPage },
    { name: 'Marketplace', component: Marketplace }
  ];
  
  testComponents.forEach(({ name, component }) => {
    if (typeof component === 'function') {
      console.log(`✅ ${name} is a valid React component`);
    } else {
      console.log(`❌ ${name} is not a valid React component`);
    }
  });
  
  console.log('🎉 Component structure test completed!');
  
} catch (error) {
  console.error('❌ Component test failed:', error.message);
}