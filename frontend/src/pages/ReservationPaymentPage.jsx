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

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const { data } = await api.get(`/api/reservations/payment/${token}`);
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
                <div className="mt-4">
                  <PayPalButton
                    reservationId={reservation._id}
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

export default ReservationPaymentPage;
