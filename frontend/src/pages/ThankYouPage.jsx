import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ShoppingCart, ArrowLeft, Calendar, Mail, MessageCircle, Phone, Download, Share2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import api from '../lib/api';

const OrderThankYou = ({ orderId, orderNumber }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        setOrder(data.data);
      } catch (err) {
        setError('Failed to fetch order details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button asChild>
          <Link to="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Thank You for Your Order! - Marrakech Reviews</title>
        <meta name="description" content="Your order has been placed successfully." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Thank You for Your Order!</h1>
            <p className="text-lg text-gray-600 mt-2">
              Your order <span className="font-semibold text-primary">{orderNumber}</span> has been placed successfully.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              We've sent a confirmation email to {order.user.email}.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>${order.itemsPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Shipping</p>
                  <p>${order.shippingPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Tax</p>
                  <p>${order.taxPrice.toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>${order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button asChild className="mr-4">
              <Link to="/my-orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const ReservationThankYou = ({ reservationData, reservationType }) => {
  const navigate = useNavigate();

  const generateReservationId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${reservationType.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  };

  const reservationId = generateReservationId();

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hello! I just made a reservation (ID: ${reservationId}) for ${reservationData.activityName || 'your service'}. Please confirm my booking details.`
    );
    const whatsappUrl = `https://wa.me/${reservationData.customerInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent(`Reservation Confirmation - ${reservationId}`);
    const body = encodeURIComponent(
      `Dear Team,\n\nI have just submitted a reservation request with the following details:\n\nReservation ID: ${reservationId}\nActivity: ${reservationData.activityName || 'Service'}\nDate: ${reservationData.reservationDate ? format(new Date(reservationData.reservationDate), 'PPP') : 'N/A'}\nPersons: ${reservationData.numberOfPersons || 'N/A'}\nTotal: $${reservationData.totalPrice || 'N/A'}\n\nPlease confirm my booking and provide payment instructions.\n\nBest regards,\n${reservationData.customerInfo.name}`
    );
    window.location.href = `mailto:Hello@marrakech.reviews?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Helmet>
        <title>Reservation Confirmed - Thank You | E-Store</title>
        <meta name="description" content="Your reservation has been successfully submitted. We will contact you shortly with confirmation details." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reservation Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-600">
              Thank you for your reservation. We'll contact you shortly to confirm your booking.
            </p>
          </div>

          {/* Reservation Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reservation Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reservation ID:</span>
                        <span className="font-mono font-medium">{reservationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Activity:</span>
                        <span className="font-medium">{reservationData.activityName}</span>
                      </div>
                      {reservationData.reservationDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{format(new Date(reservationData.reservationDate), 'PPP')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Persons:</span>
                        <span>{reservationData.numberOfPersons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="secondary">Pending Confirmation</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{reservationData.customerInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        <span>{reservationData.customerInfo.whatsapp}</span>
                      </div>
                      {reservationData.customerInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{reservationData.customerInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pricing Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${reservationData.totalPrice}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Payment instructions will be provided in your confirmation email.
                        </p>
                      </div>
                    </div>
                  </div>

                  {reservationData.customerInfo.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          {reservationData.customerInfo.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Confirmation Email</h4>
                    <p className="text-sm text-gray-600">
                      You'll receive a confirmation email within 30 minutes with detailed booking information and payment instructions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Personal Contact</h4>
                    <p className="text-sm text-gray-600">
                      Our team will contact you via WhatsApp or phone within 2 hours to confirm availability and finalize details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Payment & Final Confirmation</h4>
                    <p className="text-sm text-gray-600">
                      Complete your payment using the provided instructions to secure your reservation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Alert className="mb-8">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Your reservation is not confirmed until you receive our confirmation email and complete the payment process. 
              Please check your email (including spam folder) and keep your phone available for our call.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button 
              onClick={handleWhatsAppContact}
              className="flex items-center gap-2"
              variant="outline"
            >
              <MessageCircle className="h-4 w-4" />
              Contact via WhatsApp
            </Button>
            
            <Button 
              onClick={handleEmailContact}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
            
            <Button 
              onClick={() => window.print()}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Print Details
            </Button>
            
            <Button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'My Reservation',
                    text: `I just booked ${reservationData.activityName}! Reservation ID: ${reservationId}`,
                    url: window.location.href
                  });
                }
              }}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Continue Browsing */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Explore More Activities
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/activities')}
                className="flex items-center gap-2"
              >
                Browse Activities
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="flex items-center gap-2"
              >
                Back to Home
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderNumber, reservationData, type } = location.state || {};

  useEffect(() => {
    if (!orderId && !reservationData) {
      navigate('/', { replace: true });
    }
  }, [orderId, reservationData, navigate]);

  if (orderId) {
    return <OrderThankYou orderId={orderId} orderNumber={orderNumber} />;
  }

  if (reservationData) {
    return <ReservationThankYou reservationData={reservationData} reservationType={type || 'activity'} />;
  }

  return null;
};

export default ThankYouPage;
