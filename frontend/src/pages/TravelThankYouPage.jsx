import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Users from 'lucide-react/dist/esm/icons/users';
import Mail from 'lucide-react/dist/esm/icons/mail';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Plane from 'lucide-react/dist/esm/icons/plane';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Download from 'lucide-react/dist/esm/icons/download';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function TravelThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state?.reservationData;

  useEffect(() => {
    if (!reservationData) {
      navigate('/travels', { replace: true });
    }
  }, [reservationData, navigate]);

  if (!reservationData) {
    return null;
  }

  const reservationId = reservationData.reservationId || `TR-${Date.now().toString(36)}`;

  return (
    <>
      <Helmet>
        <title>Travel Reservation Submitted - Thank You | E-Store</title>
        <meta name="description" content="Your travel reservation has been successfully submitted. We will contact you shortly with confirmation details." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Travel Reservation Submitted!
            </h1>
            <p className="text-xl text-gray-600">
              Thank you for your booking. We'll contact you shortly to confirm your trip.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Your Travel Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reservation Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reservation ID:</span>
                        <span className="font-mono font-medium">{reservationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Program:</span>
                        <span className="font-medium">{reservationData.programName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destination:</span>
                        <span className="font-medium">{reservationData.destination}</span>
                      </div>
                      {reservationData.preferredDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{format(new Date(reservationData.preferredDate), 'PPP')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travelers:</span>
                        <span>{reservationData.numberOfTravelers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="secondary">Pending Confirmation</Badge>
                      </div>
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
                          Payment instructions will be provided upon confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="mb-8">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Your reservation is not confirmed until you receive our confirmation email and complete the payment process.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Explore More
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/travels')}>
                Browse More Travels
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
