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
  Utensils, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock,
  DollarSign,
  Users,
  Award,
  ChefHat
} from 'lucide-react';
import { productsAPI } from '../lib/api';

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || 'all');

  const { data: restaurantsData, isLoading, error } = useQuery({
    queryKey: ['restaurants', searchQuery, sortBy, priceRange],
    queryFn: () => productsAPI.getProducts({
      category: 'restaurants',
      search: searchQuery,
      sortBy: sortBy,
      priceRange: priceRange,
      limit: 20
    }).then(res => res.data),
  });

  const restaurants = restaurantsData?.data || [];

  const stats = [
    { icon: Utensils, value: '280+', label: 'Restaurants' },
    { icon: Star, value: '4.8/5', label: 'Average Rating' },
    { icon: Users, value: '50K+', label: 'Happy Diners' },
    { icon: Award, value: '15+', label: 'Award Winners' }
  ];

  const cuisineTypes = [
    'Moroccan Traditional',
    'Mediterranean',
    'French',
    'International',
    'Vegetarian',
    'Street Food'
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'budget', label: '$ Budget (Under $20)' },
    { value: 'mid', label: '$$ Mid-range ($20-50)' },
    { value: 'upscale', label: '$$$ Upscale ($50-100)' },
    { value: 'luxury', label: '$$$$ Luxury ($100+)' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'rating') params.set('sortBy', sortBy);
    if (priceRange !== 'all') params.set('priceRange', priceRange);
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Best Restaurants in Marrakech - Dining Guide</title>
        <meta name="description" content="Discover the best restaurants in Marrakech. From traditional Moroccan cuisine to international dining, find your perfect meal in the Red City." />
        <meta name="keywords" content="marrakech restaurants, moroccan food, dining, cuisine, traditional, medina, gueliz" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-orange-200" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Restaurants in Marrakech
              </h1>
              <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto mb-8">
                From traditional tagines in the medina to rooftop dining with Atlas Mountain views, 
                discover Marrakech's incredible culinary scene.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex bg-white rounded-lg p-2 shadow-lg">
                  <Input
                    type="text"
                    placeholder="Search restaurants, cuisine, location..."
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-orange-600" />
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
        <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Culinary Journey Through Marrakech
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Marrakech's dining scene is a feast for the senses, where ancient recipes meet modern innovation. 
              From bustling food stalls in Jemaa el-Fnaa serving authentic street food to elegant riads offering 
              refined Moroccan cuisine, every meal tells a story. Experience the warmth of Moroccan hospitality 
              as you savor tagines slow-cooked to perfection, fresh couscous, and mint tea served with traditional ceremony.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Traditional Medina',
                  description: 'Authentic family recipes passed down through generations',
                  icon: '🏺'
                },
                {
                  title: 'Modern Gueliz',
                  description: 'Contemporary dining with international influences',
                  icon: '🍽️'
                },
                {
                  title: 'Rooftop Terraces',
                  description: 'Stunning views of the Atlas Mountains and city',
                  icon: '🌅'
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
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <DollarSign className="h-4 w-4 mr-2" />
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
                  {restaurants.length} restaurants found
                </div>
              </div>
            </div>

            {/* Cuisine Types */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map((cuisine, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-orange-50 hover:border-orange-200"
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Restaurant Grid */}
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
                <p className="text-gray-500">Error loading restaurants. Please try again.</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No restaurants found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setPriceRange('all');
                  setSortBy('rating');
                  setSearchParams({});
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <ProductCard key={restaurant._id} product={restaurant} />
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
                Must-Try Dining Experiences
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Signature experiences that capture the essence of Marrakech's culinary culture
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Traditional Riad Dinner',
                  description: 'Multi-course Moroccan feast in an authentic riad setting',
                  features: ['Live traditional music', 'Henna painting', 'Mint tea ceremony'],
                  price: 'From $45',
                  image: '🏛️'
                },
                {
                  title: 'Cooking Class & Market Tour',
                  description: 'Learn to cook authentic tagines with a local chef',
                  features: ['Spice market visit', 'Hands-on cooking', 'Recipe booklet'],
                  price: 'From $65',
                  image: '👨‍🍳'
                },
                {
                  title: 'Rooftop Sunset Dining',
                  description: 'Panoramic views of the Atlas Mountains and medina',
                  features: ['Sunset views', 'Modern Moroccan cuisine', 'Cocktail service'],
                  price: 'From $55',
                  image: '🌅'
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
                          <Star className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">{experience.price}</span>
                      <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600">
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

