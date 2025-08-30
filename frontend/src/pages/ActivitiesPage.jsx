import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  Tag,
  Heart,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import api from '../lib/api';

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: parseInt(searchParams.get('minPrice')) || 0,
    maxPrice: parseInt(searchParams.get('maxPrice')) || 500,
    sort: searchParams.get('sort') || 'featured'
  });

  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.location) params.append('location', filters.location);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.minPrice > 0) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice < 500) params.append('maxPrice', filters.maxPrice);

        const response = await api.get(`/activities?${params.toString()}`);
        setActivities(response.data.activities);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/activities/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '' && v !== 0) {
        params.set(k, v);
      }
    });
    setSearchParams(params);
  };

  const handleActivityClick = (activity) => {
    navigate(`/activities/${activity.slug}`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category._id} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Location</h3>
        <Input
          placeholder="Enter location..."
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => {
              handleFilterChange('minPrice', min);
              handleFilterChange('maxPrice', max);
            }}
            max={500}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${filters.minPrice}</span>
            <span>${filters.maxPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Marrakech Activities | Book Tours, Excursions & Things to Do</title>
        <meta
          name="description"
          content="Find the best activities and things to do in Marrakech. Book tours, desert excursions, cooking classes, and more. Get the best prices and instant booking with Marrakech.Reviews."
        />
        <meta name="keywords" content="marrakech activities, things to do in marrakech, marrakech tours, marrakech excursions, marrakech desert trips, marrakech cooking class, book activities marrakech" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Activities & Tours
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover authentic experiences in Morocco. From desert adventures to cultural immersions, 
              find your perfect activity with competitive market prices.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Card className="sticky top-8">
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </h2>
                </CardHeader>
                <CardContent>
                  <FilterContent />
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filters & Sort */}
              <div className="flex items-center justify-between mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {pagination.total || 0} activities found
                  </span>
                  <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Activities Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-300 rounded w-full"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activities.map((activity) => (
                    <Card 
                      key={activity._id}
                      className="cursor-pointer hover:shadow-lg transition-all group"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="relative">
                        <img
                          src={activity.images[0]}
                          alt={activity.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Badge className="bg-primary">
                            {activity.category}
                          </Badge>
                          {activity.isFeatured && (
                            <Badge variant="secondary">
                              Featured
                            </Badge>
                          )}
                        </div>
                        {activity.discountPercentage > 0 && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="destructive">
                              -{Math.round(((activity.marketPrice - activity.price) / activity.marketPrice) * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                            {activity.name}
                          </h3>
                          <div className="text-right ml-2">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold text-primary">
                                ${activity.price}
                              </span>
                              {activity.marketPrice > activity.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${activity.marketPrice}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">per person</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{activity.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{activity.duration}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {renderStars(Math.floor(activity.rating))}
                          </div>
                          <span className="text-sm font-medium">{activity.rating}</span>
                          <span className="text-sm text-gray-600">({activity.numReviews} reviews)</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {activity.shortDescription}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {activity.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{activity.minParticipants}-{activity.maxParticipants} people</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.difficulty}
                          </Badge>
                        </div>
                        
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && activities.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No activities found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilters({
                        search: '',
                        category: '',
                        location: '',
                        minPrice: 0,
                        maxPrice: 500,
                        sort: 'featured'
                      });
                      setSearchParams(new URLSearchParams());
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

