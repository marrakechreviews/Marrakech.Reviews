import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Users from 'lucide-react/dist/esm/icons/users';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Star from 'lucide-react/dist/esm/icons/star';
import Wifi from 'lucide-react/dist/esm/icons/wifi';
import Car from 'lucide-react/dist/esm/icons/car';
import Coffee from 'lucide-react/dist/esm/icons/coffee';
import Shield from 'lucide-react/dist/esm/icons/shield';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function HostingReservationsPage() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    notes: ''
  });

  // Sample properties data
  const properties = [
    {
      id: 1,
      name: "Luxury Riad Marrakech",
      type: "Traditional Riad",
      location: "Medina, Marrakech",
      price: 120,
      rating: 4.8,
      reviews: 156,
      images: ["/api/placeholder/400/300"],
      amenities: ["Wifi", "Pool", "Breakfast", "Parking", "AC"],
      description: "Authentic Moroccan riad in the heart of the medina with traditional architecture and modern amenities.",
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      tripadvisorId: "12345678"
    },
    {
      id: 2,
      name: "Desert Camp Experience",
      type: "Desert Camp",
      location: "Sahara Desert, Merzouga",
      price: 85,
      rating: 4.9,
      reviews: 203,
      images: ["/api/placeholder/400/300"],
      amenities: ["Camel Trek", "Traditional Meals", "Campfire", "Stargazing"],
      description: "Unforgettable desert camping experience with luxury tents and authentic Berber hospitality.",
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      tripadvisorId: "87654321"
    },
    {
      id: 3,
      name: "Atlas Mountain Lodge",
      type: "Mountain Lodge",
      location: "Atlas Mountains, Imlil",
      price: 95,
      rating: 4.7,
      reviews: 89,
      images: ["/api/placeholder/400/300"],
      amenities: ["Hiking", "Mountain Views", "Fireplace", "Local Guides"],
      description: "Peaceful mountain retreat with stunning views and access to hiking trails.",
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      tripadvisorId: "11223344"
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReservation = (e) => {
    e.preventDefault();
    if (!selectedProperty || !checkIn || !checkOut) {
      alert('Please select a property and dates');
      return;
    }
    
    // In production, this would send data to the backend
    const reservationData = {
      property: selectedProperty,
      checkIn,
      checkOut,
      guests,
      ...formData
    };
    
    console.log('Reservation data:', reservationData);
    alert('Reservation request submitted! We will contact you shortly.');
  };

  const renderAmenityIcon = (amenity) => {
    const icons = {
      'Wifi': <Wifi className="h-4 w-4" />,
      'Pool': <Coffee className="h-4 w-4" />,
      'Breakfast': <Coffee className="h-4 w-4" />,
      'Parking': <Car className="h-4 w-4" />,
      'AC': <Shield className="h-4 w-4" />
    };
    return icons[amenity] || <Shield className="h-4 w-4" />;
  };

  return (
    <>
      <Helmet>
        <title>Hosting Reservations - Book Your Stay | Marrakech Reviews</title>
        <meta
          name="description"
          content="Book your perfect accommodation in Morocco. From luxury riads to desert camps and mountain lodges. Best prices guaranteed with TripAdvisor integration."
        />
        <meta name="keywords" content="morocco accommodation, riad booking, desert camp, mountain lodge, marrakech hotels" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hosting Reservations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover and book unique accommodations across Morocco. 
              From traditional riads to desert camps and mountain lodges.
            </p>
          </div>

          {/* TripAdvisor Integration Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                TripAdvisor Partnership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Trusted Reviews</h3>
                  <p className="text-gray-600 mb-4">
                    All our properties are verified and reviewed on TripAdvisor. 
                    Book with confidence knowing you're getting authentic experiences.
                  </p>
                  <Button variant="outline" asChild>
                    <a
                      href="https://www.tripadvisor.com/Hotels-g293734-Marrakech_Marrakech_Tensift_El_Haouz_Region-Hotels.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on TripAdvisor
                    </a>
                  </Button>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    TripAdvisor Referral Benefits
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Earn TripAdvisor points on every booking</li>
                    <li>• Access to exclusive member rates</li>
                    <li>• Priority customer support</li>
                    <li>• Special offers and promotions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {properties.map((property) => (
              <Card 
                key={property.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedProperty?.id === property.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedProperty(property)}
              >
                <div className="relative">
                  <img
                    src={`https://picsum.photos/400/250?random=${property.id}`}
                    alt={property.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-2 left-2">
                    {property.type}
                  </Badge>
                </div>
                
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{property.name}</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${property.price}
                      </p>
                      <p className="text-sm text-gray-600">per night</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{property.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(property.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{property.rating}</span>
                    <span className="text-sm text-gray-600">({property.reviews} reviews)</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {property.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {property.amenities.slice(0, 4).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{property.maxGuests} guests max</span>
                    <span>{property.bedrooms} bed • {property.bathrooms} bath</span>
                  </div>
                  
                  <Button 
                    className="w-full mt-3" 
                    variant={selectedProperty?.id === property.id ? "default" : "outline"}
                  >
                    {selectedProperty?.id === property.id ? "Selected" : "Select Property"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reservation Form */}
          {selectedProperty && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Reservation</CardTitle>
                <p className="text-gray-600">
                  Booking: {selectedProperty.name}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReservation} className="space-y-6">
                  {/* Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Check-in Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>Check-out Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            disabled={(date) => date < checkIn || date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>Number of Guests</Label>
                      <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: selectedProperty.maxGuests }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        required
                        placeholder="+212 6XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Requests (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any special requests or requirements..."
                      rows={3}
                    />
                  </div>

                  {/* Booking Summary */}
                  {checkIn && checkOut && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Booking Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Property:</span>
                          <span>{selectedProperty.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dates:</span>
                          <span>
                            {format(checkIn, "MMM dd")} - {format(checkOut, "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span>{guests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nights:</span>
                          <span>{Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>
                            ${selectedProperty.price * Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full">
                    Submit Reservation Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TripAdvisor Widget Placeholder */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>TripAdvisor Reviews Widget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">
                  TripAdvisor reviews widget will be embedded here once configured with your TripAdvisor business account.
                </p>
                <div className="bg-white rounded border p-4 text-left">
                  <h4 className="font-semibold mb-2">Integration Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>TripAdvisor Business Account</li>
                    <li>Property listing verification</li>
                    <li>Widget configuration in admin panel</li>
                    <li>TripAdvisor Partner API access</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

