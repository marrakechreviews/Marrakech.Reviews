import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import PayPalButton from '../components/PayPalButton';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ReservationPaymentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentType, setPaymentType] = useState(null); // 'partial' or 'complete'

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const { data } = await api.get(`/reservations/payment/${token}`);
        setReservation(data.data);
      } catch (err) {
        setError('Invalid or expired payment link.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [token]);

  const onPaymentSuccess = (data) => {
    navigate('/thank-you', {
      state: {
        orderId: data.order._id,
        orderNumber: data.order.orderNumber
      }
    });
  };

  const onPaymentError = () => {
    setError('Payment failed. Please try again.');
  };

  const handleCreateOrder = async (type) => {
    setPaymentType(type);
    try {
      const { data } = await api.post('/orders/from-reservation', {
        reservationId: reservation._id,
        paymentType: type
      });
      setOrderId(data.data._id);
      return data.data._id;
    } catch (error) {
      setError('Failed to create order. Please try again.');
      return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Button onClick={() => navigate('/')}>Go to Homepage</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pay for Reservation - Marrakech Reviews</title>
      </Helmet>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Pay for Your Reservation</CardTitle>
          </CardHeader>
          <CardContent>
            {reservation && (
              <div>
                <p><strong>Activity:</strong> {reservation.activity.name}</p>
                <p><strong>Date:</strong> {new Date(reservation.reservationDate).toLocaleDateString()}</p>
                <p><strong>Guests:</strong> {reservation.numberOfPersons}</p>
                <p><strong>Total:</strong> ${reservation.totalPrice}</p>

                {!orderId && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
                    <div className="flex space-x-4">
                      <Button onClick={() => handleCreateOrder('complete')} className="flex-1">
                        Pay in Full (${reservation.totalPrice})
                      </Button>
                      <Button onClick={() => handleCreateOrder('partial')} variant="outline" className="flex-1">
                        Pay Partial ($15.00)
                      </Button>
                    </div>
                  </div>
                )}

                {orderId && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {paymentType === 'partial' ? 'Partial Payment' : 'Full Payment'}
                    </h3>
                    <p className="mb-4 text-gray-600">
                      You have chosen to make a {paymentType} payment. Please proceed with PayPal.
                    </p>
                    <PayPalButton
                      orderId={orderId}
                      onPaymentSuccess={onPaymentSuccess}
                      onPaymentError={onPaymentError}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ReservationPaymentPage;
