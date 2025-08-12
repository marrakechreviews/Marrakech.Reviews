import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Plane, Calendar as CalendarIcon, Users, MapPin, Star, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const FlightReservationSection = () => {
  const [tripType, setTripType] = useState('round-trip');
  const [departureDate, setDepartureDate] = useState();
  const [returnDate, setReturnDate] = useState();
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [flightClass, setFlightClass] = useState('economy');
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');

  const suppliers = [
    {
      name: 'Skyscanner',
      logo: '✈️',
      description: 'Compare millions of flights',
      commission: 'Up to 20%',
      color: 'bg-blue-100 text-blue-700',
      url: 'https://www.skyscanner.com'
    },
    {
      name: 'Expedia',
      logo: '🌍',
      description: 'Book flights + hotels together',
      commission: 'Up to 4%',
      color: 'bg-yellow-100 text-yellow-700',
      url: 'https://www.expedia.com'
    },
    {
      name: 'Booking.com',
      logo: '🏨',
      description: 'Flights with accommodation deals',
      commission: 'Up to 3%',
      color: 'bg-green-100 text-green-700',
      url: 'https://www.booking.com/flights'
    },
    {
      name: 'Kayak',
      logo: '🚁',
      description: 'Smart flight search engine',
      commission: 'Up to 15%',
      color: 'bg-purple-100 text-purple-700',
      url: 'https://www.kayak.com'
    }
  ];

  const popularDestinations = [
    { city: 'Paris', country: 'France', code: 'CDG', price: 'from $299' },
    { city: 'Dubai', country: 'UAE', code: 'DXB', price: 'from $399' },
    { city: 'London', country: 'UK', code: 'LHR', price: 'from $349' },
    { city: 'New York', country: 'USA', code: 'JFK', price: 'from $599' },
    { city: 'Istanbul', country: 'Turkey', code: 'IST', price: 'from $249' },
    { city: 'Barcelona', country: 'Spain', code: 'BCN', price: 'from $279' }
  ];

  const handleSearch = () => {
    // This would typically redirect to a flight search results page
    // For now, we'll just log the search parameters
    console.log('Flight search:', {
      tripType,
      departure,
      destination,
      departureDate,
      returnDate,
      passengers,
      flightClass
    });
    
    // In a real implementation, you would redirect to a search results page
    // or open the preferred supplier's website with the search parameters
    alert('Flight search functionality would be implemented here!');
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Find Your Perfect Flight
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare prices from top airlines and book with confidence through our trusted partners
          </p>
        </div>

        {/* Flight Search Form */}
        <Card className="max-w-4xl mx-auto mb-12 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">
              Search Flights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Trip Type Selection */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {['round-trip', 'one-way', 'multi-city'].map((type) => (
                  <Button
                    key={type}
                    variant={tripType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTripType(type)}
                    className="capitalize"
                  >
                    {type.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Departure */}
              <div className="space-y-2">
                <Label htmlFor="departure">From</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="departure"
                    placeholder="Departure city"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="destination"
                    placeholder="Destination city"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !departureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departureDate ? format(departureDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return Date */}
              {tripType === 'round-trip' && (
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !returnDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        disabled={(date) => date < (departureDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Passengers */}
              <div className="space-y-2">
                <Label>Passengers</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      {totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Adults</div>
                          <div className="text-sm text-gray-500">12+ years</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPassengers(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{passengers.adults}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPassengers(prev => ({ ...prev, adults: prev.adults + 1 }))}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Children</div>
                          <div className="text-sm text-gray-500">2-11 years</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPassengers(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{passengers.children}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPassengers(prev => ({ ...prev, children: prev.children + 1 }))}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Infants</div>
                          <div className="text-sm text-gray-500">Under 2 years</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPassengers(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{passengers.infants}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPassengers(prev => ({ ...prev, infants: prev.infants + 1 }))}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Class */}
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={flightClass} onValueChange={setFlightClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium-economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="space-y-2">
                <Label className="invisible">Search</Label>
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Plane className="mr-2 h-4 w-4" />
                  Search Flights
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Popular Destinations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularDestinations.map((dest, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🏙️</div>
                  <h4 className="font-semibold text-sm">{dest.city}</h4>
                  <p className="text-xs text-gray-500 mb-2">{dest.country}</p>
                  <Badge variant="secondary" className="text-xs">
                    {dest.price}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partner Suppliers */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Our Trusted Partners</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suppliers.map((supplier, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{supplier.logo}</div>
                  <h4 className="font-bold text-lg mb-2">{supplier.name}</h4>
                  <p className="text-gray-600 text-sm mb-3">{supplier.description}</p>
                  <Badge className={`${supplier.color} mb-4`}>
                    Commission: {supplier.commission}
                  </Badge>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-blue-50 group-hover:border-blue-300"
                      onClick={() => window.open(supplier.url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Site
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-8">Why Book Through Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Best Prices</h4>
              <p className="text-gray-600 text-sm">Compare prices from multiple airlines and booking sites to find the best deals</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">24/7 Support</h4>
              <p className="text-gray-600 text-sm">Our travel experts are available around the clock to help with your booking</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Flexible Booking</h4>
              <p className="text-gray-600 text-sm">Easy changes and cancellations with our flexible booking policies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightReservationSection;

