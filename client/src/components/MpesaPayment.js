import React, { useState } from 'react';
import './MpesaPayment.css';

const MpesaPayment = ({ total, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input');

  const handleContinue = () => {
    if (!phone.match(/^254[17]\d{8}$/) && !phone.match(/^0[17]\d{8}$/)) {
      alert('Please enter a valid Kenyan phone number (2547XXXXXXXX or 07XXXXXXXX)');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    setLoading(true);
    // Simulate M-Pesa API call - in real implementation, this would integrate with M-Pesa API
    // For demo purposes, we'll show a message that payment prompt should appear
    alert(`M-Pesa payment prompt should appear on your phone (${formatPhone(phone)}) now. Please complete the payment by entering your M-Pesa PIN.`);

    // Simulate the actual M-Pesa STK push process
    setTimeout(() => {
      // First, show that STK push was sent
      alert('STK Push sent to your phone. Please check your phone and enter your M-Pesa PIN to complete the payment.');

      setTimeout(() => {
        setLoading(false);
        // In a real implementation, you would check payment status from M-Pesa API
        // For demo, we'll assume payment is successful after additional delay
        alert('Payment completed successfully! Processing your order...');
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }, 5000); // Wait 5 seconds for user to complete payment
    }, 2000); // Initial delay for STK push
  };

  const formatPhone = (phone) => {
    if (phone.startsWith('0')) {
      return '254' + phone.substring(1);
    }
    return phone;
  };

  if (step === 'success') {
    return (
      <div className="mpesa-success">
        <div className="success-icon">✓</div>
        <h3>Payment Successful!</h3>
        <p>M-Pesa payment of KSh {total} processed</p>
        <p>Check your phone for confirmation</p>
      </div>
    );
  }

  return (
    <div className="mpesa-payment">
      <div className="mpesa-header">
        <div className="mpesa-logo">M-PESA</div>
        <h3>Lipa na M-Pesa</h3>
      </div>
      
      {step === 'input' ? (
        <div className="mpesa-input-section">
          <div className="input-group">
            <label>Enter your M-Pesa number:</label>
            <input
              type="tel"
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="phone-input"
              onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
            />
          </div>
          <button 
            onClick={handleContinue}
            disabled={!phone}
            className="mpesa-btn continue-btn"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="mpesa-confirm-section">
          <div className="payment-details">
            <p><strong>Amount:</strong> KSh {total}</p>
            <p><strong>Phone:</strong> {formatPhone(phone)}</p>
            <p className="instruction">You will receive an M-Pesa prompt on your phone</p>
          </div>
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="mpesa-btn confirm-btn"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
          <button 
            onClick={() => setStep('input')}
            className="mpesa-btn back-btn"
          >
            Change Number
          </button>
        </div>
      )}
    </div>
  );
};

export default MpesaPayment;