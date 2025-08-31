import React from 'react';
import PayPalButton from '../PayPalButton';

const ExpressCheckout = ({ orderData, onPaymentSuccess, onPaymentError }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Express Checkout</h2>
      <div className="flex justify-center">
        <PayPalButton
          orderData={orderData}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          isExpress={true}
        />
      </div>
    </div>
  );
};

export default ExpressCheckout;
