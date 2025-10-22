import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).role : null;
  });
  
  // Shared products that all users can see
  const [allProducts, setAllProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setUserProducts([]);
    setOrderHistory([]);
    localStorage.removeItem('user');
  };

  const signup = (userData) => {
    login(userData);
  };

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      farmer: user.name,
      farmerId: user.id
    };
    setUserProducts(prev => [...prev, newProduct]);
    setAllProducts(prev => [...prev, newProduct]); // Add to shared products
  };

  const addOrder = (cartItems, totalPrice) => {
    const order = {
      id: Date.now(),
      items: cartItems,
      total: totalPrice,
      date: new Date().toLocaleDateString(),
      status: 'Completed'
    };
    setOrderHistory(prev => [...prev, order]);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      userProducts, 
      allProducts, // Add this
      orderHistory, 
      login, 
      logout, 
      signup, 
      addProduct, 
      addOrder 
    }}>
      {children}
    </AuthContext.Provider>
  );
};