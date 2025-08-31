import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import api from '../lib/api';

const PayPalButton = ({ orderData, onPaymentSuccess, onPaymentError, isExpress = false, disabled = false, reservationId = null }) => {
  const [orderId, setOrderId] = useState(null);

  const createOrder = async () => {
    try {
      let createdOrder;
      if (reservationId) {
        const { data } = await api.post('/api/orders/from-reservation', { reservationId });
        createdOrder = data.data;
      } else {
        const { data } = await api.post('/api/orders', orderData);
        createdOrder = data.data;
      }
      setOrderId(createdOrder._id);
      const paypalOrder = await api.post(`/api/orders/${createdOrder._id}/create-paypal-order`);
      return paypalOrder.data.orderID;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order.');
      onPaymentError();
      return null;
    }
  };

  const onApprove = async (data) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/capture-paypal-order`, {
        paypalOrderID: data.orderID,
      });
      toast.success('Payment successful!');
      onPaymentSuccess(response.data);
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
      style={{ layout: isExpress ? 'horizontal' : 'vertical' }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      disabled={disabled}
    />
  );
};

const PayPalWrapper = (props) => {
  const [paypalClientId, setPaypalClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaypalClientId = async () => {
      try {
        const { data } = await api.get('/api/config/paypal');
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
