import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import api from '../lib/api';

const PayPalButton = ({ orderData, onPaymentSuccess, onPaymentError, receiverEmail, validateForm }) => {
  const [loading, setLoading] = useState(false);

  const createLocalOrder = async () => {
    if (validateForm && !validateForm()) {
      return null;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', orderData);
      toast.success('Order created. Proceed to payment.');
      return data.data._id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order.');
      onPaymentError();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPayPalOrder = async () => {
    const localOrderId = await createLocalOrder();
    if (!localOrderId) return null;

    try {
      const response = await api.post(`/orders/${localOrderId}/create-paypal-order`, { receiverEmail });
      return response.data.orderID;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create PayPal order.');
      onPaymentError();
      return null;
    }
  };

  const [createdOrderId, setCreatedOrderId] = useState(null);

  const createLocalOrder = async () => {
    if (validateForm && !validateForm()) {
      return null;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', orderData);
      toast.success('Order created. Proceed to payment.');
      setCreatedOrderId(data.data._id);
      return data.data._id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order.');
      onPaymentError();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data) => {
    try {
      const response = await api.put(`/orders/${createdOrderId}/capture-paypal-order`, {
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

  console.log("PayPal Client ID:", paypalConfig.clientId);
  if (!paypalConfig.clientId || !paypalConfig.clientId.startsWith('A')) {
    return <div className="text-red-500">Could not load PayPal. Invalid Client ID.</div>;
  }

  return (
    <PayPalScriptProvider options={{ 'client-id': paypalConfig.clientId }}>
      <PayPalButton {...props} receiverEmail={paypalConfig.receiverEmail} />
    </PayPalScriptProvider>
  );
};

export default PayPalWrapper;
