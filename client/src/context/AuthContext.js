import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set base URL for API calls
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:5000';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // For demo, we'll set a mock user - in real app, verify with backend
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (userData) => {
    try {
      const response = await axios.post('/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // ADD THIS SIGNUP FUNCTION - it was missing!
  const signup = async (userData) => {
    try {
      // For demo purposes, create user locally since backend isn't ready
      const user = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profilePicture: userData.profilePicture || null
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Signup failed' 
      };
    }
  };

  const login = async (credentials) => {
    try {
      // For demo purposes, create user locally since backend isn't ready
      const user = {
        id: Date.now(),
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: 'buyer' // Default role for demo
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    register,
    signup, // ADD THIS - it was missing from the exported value!
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}