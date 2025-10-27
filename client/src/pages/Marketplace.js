import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MarketplacePage.css'; 
import { mockProducts } from '../data/mockProducts'; 

const Marketplace = ({ products = mockProducts }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">
        <h1>Marketplace</h1>
        <p>Browse and shop for fresh farm produce</p>
        <div className="marketplace-content">
          <p>Marketplace features coming soon...</p>
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Price: {product.price}</p>
              <button onClick={() => navigate(`/products/${product.id}`)}>View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;