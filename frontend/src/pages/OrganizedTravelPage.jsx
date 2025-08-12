import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Star,
  Camera,
  Utensils,
  Bed,
  Car,
  Phone,
  Mail,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';

const OrganizedTravelPage = () => {
  const { destination } = useParams();
  const [travelProgram, setTravelProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfTravelers: 1,
    preferredDate: '',
    specialRequests: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    const fetchTravelProgram = async () => {
      try {
        const response = await api.get(`organized-travel/${destination}`);
        setTravelProgram(response.data);
      } catch (error) {
        console.error('Error fetching travel program:', error);
        setError('Failed to load travel program details');
      } finally {
        setLoading(false);
      }
    };

    if (destination) {
      fetchTravelProgram();
    }
  }, [destination]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const reservationData = {
        ...formData,
        destination,
        programId: travelProgram?._id,
        totalPrice: travelProgram?.price * formData.numberOfTravelers
      };

      await api.post("organized-travel/reservations", reservationData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setError('Failed to submit reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading travel program...</p>
        </div>
      </div>
    );
  }

  if (error && !travelProgram) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Program Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Reservation Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your reservation. We'll contact you within 24 hours to confirm your travel details.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{travelProgram?.title} - Organized Travel | Your Travel Site</title>
        <meta name="description" content={travelProgram?.description} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={travelProgram?.heroImage || `/images/destinations/${destination}.png`}
          alt={travelProgram?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {travelProgram?.title || `Discover ${destination}`}
            </h1>
            <p className="text-xl md:text-2xl">
              {travelProgram?.subtitle || 'An unforgettable organized travel experience'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Program Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Program Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {travelProgram?.description || 
                    `Experience the best of ${destination} with our carefully curated travel program. 
                    Discover hidden gems, taste authentic cuisine, and immerse yourself in the local culture 
                    with expert guides and premium accommodations.`}
                </p>
              </CardContent>
            </Card>

            {/* Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-500" />
                  Itinerary Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {travelProgram?.itinerary?.map((day, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-lg">Day {day.day}: {day.title}</h4>
                      <p className="text-gray-600">{day.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {day.activities?.map((activity, actIndex) => (
                          <Badge key={actIndex} variant="secondary">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )) || (
                    <div className="space-y-4">
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-lg">Day 1: Arrival & City Tour</h4>
                        <p className="text-gray-600">Welcome to {destination}! City orientation and local cuisine tasting.</p>
                      </div>
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-lg">Day 2: Cultural Immersion</h4>
                        <p className="text-gray-600">Explore historical sites, local markets, and traditional crafts.</p>
                      </div>
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-lg">Day 3: Adventure & Relaxation</h4>
                        <p className="text-gray-600">Outdoor activities and leisure time at premium locations.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Included Services */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Bed className="h-5 w-5 text-red-500" />
                    <span>Premium Accommodation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Utensils className="h-5 w-5 text-red-500" />
                    <span>All Meals Included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-red-500" />
                    <span>Private Transportation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-red-500" />
                    <span>Expert Local Guide</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-red-500" />
                    <span>Photography Sessions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-red-500" />
                    <span>VIP Experiences</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            {travelProgram?.gallery && travelProgram.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-red-500" />
                    Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {travelProgram.gallery.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${destination} gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reservation Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-500" />
                  Make a Reservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Price per person:</span>
                    <span className="text-2xl font-bold text-red-600">
                      ${travelProgram?.price || 599}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{travelProgram?.duration || '3 days / 2 nights'}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="numberOfTravelers">Number of Travelers *</Label>
                    <Input
                      id="numberOfTravelers"
                      name="numberOfTravelers"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.numberOfTravelers}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredDate">Preferred Start Date *</Label>
                    <Input
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Dietary restrictions, accessibility needs, special occasions..."
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total Price:</span>
                      <span className="text-2xl font-bold text-red-600">
                        ${(travelProgram?.price || 599) * formData.numberOfTravelers}
                      </span>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Reserve Now'}
                    </Button>
                  </div>
                </form>

                <div className="mt-4 text-sm text-gray-600 text-center">
                  <p>Secure booking • No payment required now</p>
                  <p>We'll contact you to confirm details</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizedTravelPage;

