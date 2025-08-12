import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ProductCard from '../components/ProductCard';
import { 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  Bed, 
  Wifi,
  Car,
  Coffee,
  Users,
  Award,
  Home,
  Building
} from 'lucide-react';
import { productsAPI } from '../lib/api';

export default function HostingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || 'all');
  const [accommodationType, setAccommodationType] = useState(searchParams.get('type') || 'all');

  const { data: hostingData, isLoading, error } = useQuery({
    queryKey: ['hosting', searchQuery, sortBy, priceRange, accommodationType],
    queryFn: () => productsAPI.getProducts({
      category: 'hosting',
      search: searchQuery,
      sortBy: sortBy,
      priceRange: priceRange,
      type: accommodationType,
      limit: 20
    }).then(res => res.data),
  });

  const accommodations = hostingData?.data || [];

  const stats = [
    { icon: Home, value: '120+', label: 'Properties' },
    { icon: Star, value: '4.9/5', label: 'Average Rating' },
    { icon: Users, value: '25K+', label: 'Happy Guests' },
    { icon: Award, value: '8+', label: 'Award Winners' }
  ];

  const accommodationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'riad', label: 'Traditional Riads' },
    { value: 'hotel', label: 'Hotels' },
    { value: 'guesthouse', label: 'Guesthouses' },
    { value: 'villa', label: 'Private Villas' },
    { value: 'apartment', label: 'Apartments' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'budget', label: '$ Budget (Under $50/night)' },
    { value: 'mid', label: '$$ Mid-range ($50-150/night)' },
    { value: 'luxury', label: '$$$ Luxury ($150-300/night)' },
    { value: 'ultra', label: '$$$$ Ultra Luxury ($300+/night)' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' }
  ];

  const amenities = [
    { icon: Wifi, label: 'Free WiFi' },
    { icon: Car, label: 'Parking' },
    { icon: Coffee, label: 'Breakfast' },
    { icon: Building, label: 'Pool' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'rating') params.set('sortBy', sortBy);
    if (priceRange !== 'all') params.set('priceRange', priceRange);
    if (accommodationType !== 'all') params.set('type', accommodationType);
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Best Hotels & Riads in Marrakech - Accommodation Guide</title>
        <meta name="description" content="Find the perfect place to stay in Marrakech. From luxury riads in the medina to modern hotels in Gueliz, discover authentic Moroccan hospitality." />
        <meta name="keywords" content="marrakech hotels, riads, accommodation, medina, gueliz, luxury, traditional, morocco" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Home className="h-16 w-16 mx-auto mb-4 text-green-200" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Accommodation in Marrakech
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
                From traditional riads with stunning courtyards to luxury hotels with modern amenities, 
                find your perfect home away from home in the Red City.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex bg-white rounded-lg p-2 shadow-lg">
                  <Input
                    type="text"
                    placeholder="Search hotels, riads, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 focus-visible:ring-0 text-foreground"
                  />
                  <Button type="submit" size="sm" className="ml-2">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-100 to-teal-100 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Category Description */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-teal-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Authentic Moroccan Hospitality
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Experience the legendary warmth of Moroccan hospitality in accommodations that range from 
              centuries-old riads with intricate tilework and peaceful courtyards to contemporary hotels 
              offering world-class amenities. Whether you choose to stay in the heart of the medina's 
              bustling souks or the modern Gueliz district, each property offers a unique gateway to 
              Marrakech's rich culture and timeless charm.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Historic Riads',
                  description: 'Traditional houses with central courtyards and authentic architecture',
                  icon: '🏛️'
                },
                {
                  title: 'Luxury Hotels',
                  description: 'Modern comfort with Moroccan elegance and world-class service',
                  icon: '🏨'
                },
                {
                  title: 'Desert Camps',
                  description: 'Unique overnight experiences under the Sahara stars',
                  icon: '⛺'
                }
              ].map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Select value={accommodationType} onValueChange={setAccommodationType}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Building className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accommodationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Bed className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-gray-600">
                  {accommodations.length} properties found
                </div>
              </div>
            </div>

            {/* Popular Amenities */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-green-50 hover:border-green-200 flex items-center gap-1"
                    >
                      <Icon className="h-3 w-3" />
                      {amenity.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Accommodation Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="bg-gray-200 h-4 rounded"></div>
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Error loading accommodations. Please try again.</p>
              </div>
            ) : accommodations.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No accommodations found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setPriceRange('all');
                  setAccommodationType('all');
                  setSortBy('rating');
                  setSearchParams({});
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accommodations.map((accommodation) => (
                  <ProductCard key={accommodation._id} product={accommodation} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Signature Accommodation Experiences
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Unique stays that showcase the best of Marrakech's hospitality and culture
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Luxury Riad Experience',
                  description: 'Stay in a restored 18th-century riad with traditional architecture',
                  features: ['Private courtyard', 'Rooftop terrace', 'Traditional hammam', 'Butler service'],
                  price: 'From $180/night',
                  image: '🏛️'
                },
                {
                  title: 'Desert Camp Adventure',
                  description: 'Overnight in luxury tents in the Sahara Desert',
                  features: ['Camel trekking', 'Berber dinner', 'Stargazing', 'Sunrise views'],
                  price: 'From $120/night',
                  image: '⛺'
                },
                {
                  title: 'Atlas Mountains Retreat',
                  description: 'Eco-lodge with stunning mountain views and hiking trails',
                  features: ['Mountain views', 'Organic meals', 'Guided hikes', 'Spa treatments'],
                  price: 'From $95/night',
                  image: '🏔️'
                }
              ].map((experience, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className="text-6xl mb-4">{experience.image}</div>
                    <CardTitle className="text-xl">{experience.title}</CardTitle>
                    <p className="text-gray-600">{experience.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {experience.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">{experience.price}</span>
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-teal-600">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

