import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    profilePicture: null
  });
  const [preview, setPreview] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture' && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      profile_picture: preview
    };

    const result = await register(userData);
    if (result.success) {
      navigate('/login');
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">I am a...</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="buyer">Buyer</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture (Optional)</label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Profile preview" />
              </div>
            )}
          </div>
          <button type="submit" className="auth-btn">Create Account</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;