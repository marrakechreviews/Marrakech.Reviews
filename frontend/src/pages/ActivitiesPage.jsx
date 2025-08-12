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

  // Sample activities data (in production, this would come from API)
  const sampleActivities = [
    {
      id: 1,
      name: "Sahara Desert Camel Trek",
      slug: "sahara-desert-camel-trek",
      shortDescription: "Experience the magic of the Sahara with an authentic camel trek and overnight camping under the stars.",
      price: 120,
      marketPrice: 180,
      currency: "USD",
      category: "Desert Tours",
      location: "Merzouga, Sahara Desert",
      duration: "2 Days, 1 Night",
      maxParticipants: 12,
      minParticipants: 2,
      rating: 4.9,
      numReviews: 156,
      image: "https://picsum.photos/400/300?random=1",
      tags: ["Adventure", "Camping", "Photography"],
      difficulty: "Moderate",
      included: ["Camel trek", "Desert camp", "Traditional meals", "Berber guide"],
      isFeatured: true
    },
    {
      id: 2,
      name: "Marrakech Food Walking Tour",
      slug: "marrakech-food-walking-tour",
      shortDescription: "Discover the authentic flavors of Marrakech with a guided food tour through the medina and local markets.",
      price: 45,
      marketPrice: 65,
      currency: "USD",
      category: "Food & Cooking",
      location: "Marrakech Medina",
      duration: "4 Hours",
      maxParticipants: 8,
      minParticipants: 2,
      rating: 4.8,
      numReviews: 203,
      image: "https://picsum.photos/400/300?random=2",
      tags: ["Food", "Culture", "Walking"],
      difficulty: "Easy",
      included: ["Food tastings", "Local guide", "Market visit", "Recipe cards"],
      isFeatured: true
    },
    {
      id: 3,
      name: "Atlas Mountains Hiking Adventure",
      slug: "atlas-mountains-hiking-adventure",
      shortDescription: "Explore the stunning Atlas Mountains with a full-day hiking adventure to traditional Berber villages.",
      price: 85,
      marketPrice: 120,
      currency: "USD",
      category: "Adventure Sports",
      location: "Atlas Mountains, Imlil",
      duration: "Full Day (8 Hours)",
      maxParticipants: 10,
      minParticipants: 4,
      rating: 4.7,
      numReviews: 89,
      image: "https://picsum.photos/400/300?random=3",
      tags: ["Hiking", "Nature", "Villages"],
      difficulty: "Challenging",
      included: ["Mountain guide", "Lunch", "Transportation", "Equipment"],
      isFeatured: false
    },
    {
      id: 4,
      name: "Traditional Moroccan Cooking Class",
      slug: "traditional-moroccan-cooking-class",
      shortDescription: "Learn to cook authentic Moroccan dishes in a traditional riad with a local chef.",
      price: 65,
      marketPrice: 90,
      currency: "USD",
      category: "Food & Cooking",
      location: "Marrakech Medina",
      duration: "5 Hours",
      maxParticipants: 6,
      minParticipants: 2,
      rating: 4.9,
      numReviews: 124,
      image: "https://picsum.photos/400/300?random=4",
      tags: ["Cooking", "Culture", "Traditional"],
      difficulty: "Easy",
      included: ["Ingredients", "Recipe book", "Lunch", "Apron"],
      isFeatured: true
    },
    {
      id: 5,
      name: "Essaouira Day Trip",
      slug: "essaouira-day-trip",
      shortDescription: "Visit the charming coastal city of Essaouira with its historic medina and beautiful beaches.",
      price: 95,
      marketPrice: 130,
      currency: "USD",
      category: "Day Trips",
      location: "Essaouira",
      duration: "Full Day (10 Hours)",
      maxParticipants: 15,
      minParticipants: 4,
      rating: 4.6,
      numReviews: 78,
      image: "https://picsum.photos/400/300?random=5",
      tags: ["Coastal", "History", "Beach"],
      difficulty: "Easy",
      included: ["Transportation", "Guide", "Free time", "Lunch option"],
      isFeatured: false
    },
    {
      id: 6,
      name: "Traditional Hammam & Spa Experience",
      slug: "traditional-hammam-spa-experience",
      shortDescription: "Relax and rejuvenate with an authentic Moroccan hammam and spa treatment.",
      price: 55,
      marketPrice: 80,
      currency: "USD",
      category: "Wellness & Spa",
      location: "Marrakech",
      duration: "3 Hours",
      maxParticipants: 4,
      minParticipants: 1,
      rating: 4.8,
      numReviews: 167,
      image: "https://picsum.photos/400/300?random=6",
      tags: ["Spa", "Relaxation", "Traditional"],
      difficulty: "Easy",
      included: ["Hammam treatment", "Massage", "Tea", "Towels"],
      isFeatured: false
    }
  ];

  const sampleCategories = [
    { _id: 'Desert Tours', count: 8, averagePrice: 125 },
    { _id: 'Food & Cooking', count: 12, averagePrice: 55 },
    { _id: 'Adventure Sports', count: 6, averagePrice: 95 },
    { _id: 'Day Trips', count: 10, averagePrice: 85 },
    { _id: 'Wellness & Spa', count: 5, averagePrice: 65 },
    { _id: 'Cultural Experiences', count: 15, averagePrice: 45 }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setActivities(sampleActivities);
      setCategories(sampleCategories);
      setLoading(false);
    }, 1000);
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

  const filteredActivities = activities.filter(activity => {
    if (filters.search && !activity.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && activity.category !== filters.category) {
      return false;
    }
    if (filters.location && !activity.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (activity.price < filters.minPrice || activity.price > filters.maxPrice) {
      return false;
    }
    return true;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (filters.sort) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.numReviews - a.numReviews;
      case 'featured':
      default:
        return b.isFeatured - a.isFeatured || b.rating - a.rating;
    }
  });

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
        <title>Activities & Tours in Morocco - Book Your Adventure | E-Store</title>
        <meta
          name="description"
          content="Discover amazing activities and tours in Morocco. From desert adventures to cooking classes, book your perfect experience with market prices and instant confirmation."
        />
        <meta name="keywords" content="morocco activities, desert tours, cooking classes, marrakech tours, adventure sports" />
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
                    {sortedActivities.length} activities found
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
                  {sortedActivities.map((activity) => (
                    <Card 
                      key={activity.id} 
                      className="cursor-pointer hover:shadow-lg transition-all group"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="relative">
                        <img
                          src={activity.image}
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

              {!loading && sortedActivities.length === 0 && (
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

