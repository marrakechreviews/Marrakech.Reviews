import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import api from '../lib/api';

const PayPalButton = ({ orderId, paymentToken, onPaymentSuccess, onPaymentError, receiverEmail }) => {

  const createPayPalOrder = async () => {
    const url = paymentToken
      ? `/orders/payment/${paymentToken}/create-paypal-order`
      : `/orders/${orderId}/create-paypal-order`;
    try {
      const response = await api.post(url, { receiverEmail });
      return response.data.orderID;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create PayPal order.');
      onPaymentError();
      return null;
    }
  };

  const onApprove = async (data) => {
    const url = paymentToken
      ? `/orders/payment/${paymentToken}/capture-paypal-order`
      : `/orders/${orderId}/capture-paypal-order`;
    try {
      const response = await api.put(url, {
        paypalOrderID: data.orderID,
      });
      toast.success('Payment successful!');
      onPaymentSuccess(response.data.order);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed.');
      onPaymentError();
    }
  };

  const onError = (err) => {
    toast.error('An error occurred during the PayPal transaction.');
    console.error('PayPal error:', err);
    onPaymentError();
  };

  return (
    <PayPalButtons
      createOrder={createPayPalOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
};

const PayPalWrapper = (props) => {
  const [paypalConfig, setPaypalConfig] = useState({ clientId: null, receiverEmail: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaypalConfig = async () => {
      try {
        const { data } = await api.get('/orders/config/paypal');
        setPaypalConfig({ clientId: data.clientId, receiverEmail: data.receiverEmail });
      } catch (error) {
        toast.error('Failed to fetch PayPal configuration.');
        console.error('PayPal config fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaypalConfig();
  }, []);

  if (loading) {
    return <div>Loading PayPal...</div>;
  }

  if (!paypalConfig.clientId) {
    return <div className="text-red-500">Could not load PayPal. Please try again later.</div>;
  }

  return (
    <PayPalScriptProvider options={{ 'client-id': paypalConfig.clientId }}>
      <PayPalButton {...props} receiverEmail={paypalConfig.receiverEmail} />
    </PayPalScriptProvider>
  );
};

export default PayPalWrapper;
