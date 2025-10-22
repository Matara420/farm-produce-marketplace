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
  const [userProducts, setUserProducts] = useState([]); // Products added by the current user
  const [orderHistory, setOrderHistory] = useState([]); // Order history for buyers

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setUserProducts([]);
    localStorage.removeItem('user');
  };

  const signup = (userData) => {
    // Mock signup, in real app call API
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
    <AuthContext.Provider value={{ user, role, userProducts, orderHistory, login, logout, signup, addProduct, addOrder }}>
      {children}
    </AuthContext.Provider>
  );
};
