import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../lib/api';
import PayPalButton from '../components/PayPalButton';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const OrderPaymentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersAPI.getOrderByToken(token);
        if (data.data.isPaid) {
          setError('This order has already been paid.');
        } else {
          setOrder(data.data);
        }
      } catch (err) {
        setError('Failed to fetch order details. The payment link may be invalid or expired.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const onPaymentSuccess = (data) => {
    toast.success('Payment successful!');
    navigate('/thank-you', {
      state: {
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });
  };

  const onPaymentError = () => {
    toast.error('Payment failed. Please try again.');
    setError('Payment failed. Please try again.');
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/')}>Go to Homepage</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pay for Your Order - Marrakech Reviews</title>
      </Helmet>
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {order && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
                <p className="mb-4">Order ID: {order.orderNumber || order._id}</p>

                <div className="border-t border-b py-4 my-4">
                  {order.orderItems.map(item => (
                    <div key={item.product} className="flex justify-between items-center mb-2">
                      <span>{item.name} x {item.qty}</span>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xl font-bold flex justify-between">
                  <span>Total:</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>

                <div className="mt-6">
                  <PayPalButton
                    orderId={order._id}
                    paymentToken={token}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={onPaymentError}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OrderPaymentPage;
