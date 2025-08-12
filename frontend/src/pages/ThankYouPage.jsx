import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Mail, 
  MessageCircle, 
  Phone,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state?.reservationData;
  const reservationType = location.state?.type || 'activity';

  useEffect(() => {
    // If no reservation data, redirect to home
    if (!reservationData) {
      navigate('/', { replace: true });
    }
  }, [reservationData, navigate]);

  if (!reservationData) {
    return null;
  }

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
    window.location.href = `mailto:info@example.com?subject=${subject}&body=${body}`;
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

          {/* Contact Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Call Us</h4>
                  <p className="text-sm text-gray-600">+212 524-123456</p>
                </div>
                
                <div>
                  <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">WhatsApp</h4>
                  <p className="text-sm text-gray-600">+212 6XX-XXXXXX</p>
                </div>
                
                <div>
                  <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Email</h4>
                  <p className="text-sm text-gray-600">info@example.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

