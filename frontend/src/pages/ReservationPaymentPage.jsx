import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import PayPalButton from '../components/PayPalButton';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const ReservationPaymentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [paymentType, setPaymentType] = useState('full');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

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

  const handleCreateReservationOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const isPartial = paymentType === 'partial';
      const { data } = await api.post('/orders/from-reservation', {
        reservationId: reservation._id,
        isPartial: isPartial,
      });
      setCreatedOrderId(data.data._id);
    } catch (error) {
      setError('Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go to Homepage</Button>
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

                <div className="my-4">
                  <Label>Payment Options</Label>
                  <RadioGroup defaultValue="full" onValueChange={setPaymentType} className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="r1" />
                      <Label htmlFor="r1">Full Payment (${reservation.totalPrice})</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id="r2" />
                      <Label htmlFor="r2">Partial Payment ($15 to reserve)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="mt-4">
                  {!createdOrderId ? (
                    <Button onClick={handleCreateReservationOrder} disabled={isCreatingOrder}>
                      {isCreatingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Proceed to Payment
                    </Button>
                  ) : (
                    <PayPalButton
                      orderId={createdOrderId}
                      onPaymentSuccess={onPaymentSuccess}
                      onPaymentError={onPaymentError}
                    />
                  )}
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
