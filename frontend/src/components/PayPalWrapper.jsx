import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import api from '../lib/api';

const PayPalButton = ({ orderId, paymentToken, onPaymentSuccess, onPaymentError, orderData, creationUrl = '/orders', onClick }) => {
  const [internalOrderId, setInternalOrderId] = useState(orderId);

  useEffect(() => {
    setInternalOrderId(orderId);
  }, [orderId]);

  const createOrder = async (data, actions) => {
    let currentOrderId = internalOrderId;

    if (orderData && !currentOrderId) {
      try {
        const res = await api.post(creationUrl, orderData);
        currentOrderId = res.data.data._id;
        setInternalOrderId(currentOrderId);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create order.');
        onPaymentError();
        return Promise.reject(new Error('Order creation failed'));
      }
    }

    if (!currentOrderId && !paymentToken) {
      toast.error('Order information is missing.');
      onPaymentError();
      return Promise.reject(new Error('Missing order ID'));
    }

    const url = paymentToken
      ? `/orders/payment/${paymentToken}/create-paypal-order`
      : `/orders/${currentOrderId}/create-paypal-order`;

    try {
      const res = await api.post(url);
      return res.data.orderID;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create PayPal order.');
      onPaymentError();
      return Promise.reject(new Error('PayPal order creation failed'));
    }
  };

  const onApprove = async (data, actions) => {
    const url = paymentToken
      ? `/orders/payment/${paymentToken}/capture-paypal-order`
      : `/orders/${internalOrderId}/capture-paypal-order`;
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
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      onClick={onClick}
    />
  );
};

const PayPalWrapper = (props) => {
  const [paypalClientId, setPaypalClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaypalClientId = async () => {
      try {
        const { data } = await api.get('/config/paypal');
        setPaypalClientId(data.clientId);
      } catch (error) {
        toast.error('Failed to fetch PayPal configuration.');
        console.error('PayPal config fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaypalClientId();
  }, []);

  if (loading) {
    return <div>Loading PayPal...</div>;
  }

  if (!paypalClientId) {
    return <div className="text-red-500">Could not load PayPal. Please try again later.</div>;
  }

  return (
    <PayPalScriptProvider options={{ 'client-id': paypalClientId }}>
      <PayPalButton {...props} />
    </PayPalScriptProvider>
  );
};

export default PayPalWrapper;
