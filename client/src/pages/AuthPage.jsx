import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Adjust import path as needed
import './AuthPage.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'buyer',
    profilePicture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, profilePicture: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (isSignUp && !formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        const userData = {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };
        
        result = await register(userData);
      } else {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        console.log(`${isSignUp ? 'Registration' : 'Login'} successful!`);
      } else {
        setError(result.error || `Something went wrong during ${isSignUp ? 'registration' : 'login'}`);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'buyer',
      profilePicture: null
    });
    setPreviewImage(null);
    setError('');
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>{isSignUp ? 'Create Account' : 'Sign In'}</h1>
        
        {error && (
          <div className="error-message" style={{
            color: '#f44336',
            backgroundColor: '#ffeaea',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            border: '1px solid #f44336'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="role">I am a...</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="role-select"
                >
                  <option value="buyer">Buyer</option>
                  <option value="farmer">Farmer</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture (Optional)</label>
                <div className="file-input-container">
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="file-input"
                    />
                  </div>
                </div>
                
                {previewImage && (
                  <div className="image-preview">
                    <img src={previewImage} alt="Profile preview" />
                  </div>
                )}
                
                <div style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  marginTop: '0.5rem'
                }}>
                  Supported formats: JPG, PNG, WEBP. Max size: 5MB
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="auth-link">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={switchMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              cursor: 'pointer',
              fontWeight: '700',
              marginLeft: '0.5rem',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Sign in' : 'Create one'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;