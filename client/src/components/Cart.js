import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MpesaPayment from './MpesaPayment';
import './Cart.css';

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useAuth();
  const [showPayment, setShowPayment] = useState(false);

  const handleCheckout = () => {
    const totalPrice = getTotalPrice();
    addOrder(cart, totalPrice);
    alert(`Checkout successful! Total: KSh ${totalPrice.toFixed(2)}\n\nThank you for your purchase!`);
    clearCart();
    setShowPayment(false);
    onClose();
  };

  const handleMpesaSuccess = () => {
    handleCheckout();
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            cart.map(item => {
              // Ensure price is a number
              const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
              
              return (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.farmer}</p>
                    <p>KSh {price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <strong>Total: KSh {getTotalPrice().toFixed(2)}</strong>
            </div>
            
            {!showPayment ? (
              <button 
                className="checkout-btn" 
                onClick={() => setShowPayment(true)}
              >
                Proceed to Checkout
              </button>
            ) : (
              <MpesaPayment 
                total={getTotalPrice()} 
                onSuccess={handleMpesaSuccess}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;