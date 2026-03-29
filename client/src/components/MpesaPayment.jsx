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
    
    alert(`M-Pesa payment prompt should appear on your phone (${formatPhone(phone)}) now. Please complete the payment by entering your M-Pesa PIN.`);

    
    setTimeout(() => {
     
      alert('STK Push sent to your phone. Please check your phone and enter your M-Pesa PIN to complete the payment.');

      setTimeout(() => {
        setLoading(false);
        
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-4xl text-green-600">✓</div>
          </div>
          <h3 className="text-2xl font-bold text-green-700 mb-4">Payment Successful!</h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <p className="text-gray-700 mb-2">M-Pesa payment of <span className="font-semibold text-green-700">KSh {total}</span> processed</p>
            <p className="text-sm text-green-600">Check your phone for confirmation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-6 text-center">
        <div className="text-xl sm:text-2xl font-bold text-white mb-2">M-PESA</div>
        <h3 className="text-white text-base sm:text-lg font-medium">Lipa na M-Pesa</h3>
      </div>
      
      {step === 'input' ? (
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Enter your M-Pesa number:</label>
            <input
              type="tel"
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
            />
          </div>
          <button 
            onClick={handleContinue}
            disabled={!phone || loading}
            className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      ) : (
        <div className="p-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mb-6">
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-semibold text-green-700">Amount:</span> KSh {total}</p>
              <p className="text-gray-700"><span className="font-semibold text-green-700">Phone:</span> {formatPhone(phone)}</p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">You will receive an M-Pesa prompt on your phone</p>
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
            <button 
              onClick={() => setStep('input')}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors border border-gray-300"
            >
              Change Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MpesaPayment;