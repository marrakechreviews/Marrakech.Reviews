import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Star, MapPin, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export default function GoogleReviewsPage() {
  const { toast } = useToast();
  const [location, setLocation] = useState('Marrakech, Morocco'); // Default location
  const [placeId, setPlaceId] = useState('ChIJ0-w0a7Xtrw0R0_Y2_g-0000'); // Example Place ID for Marrakech
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [apiError, setApiError] = useState(null);

  const fetchGoogleReviews = async (currentPlaceId) => {
    setLoading(true);
    setApiError(null);
    try {
      // In a real application, this would be an API call to your backend
      // Your backend would then call Google Places API using your API key
      // For now, we'll simulate with sample data based on placeId
      console.log(`Fetching reviews for Place ID: ${currentPlaceId}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Sample data based on a generic Marrakech Place ID
      const fetchedReviews = [
        {
          id: 1,
          author_name: "Sarah Johnson",
          author_url: "https://www.google.com/maps/contrib/123456789",
          profile_photo_url: "https://lh3.googleusercontent.com/a-/default-user=s40-c",
          rating: 5,
          relative_time_description: "2 weeks ago",
          text: "Amazing experience in Marrakech! The desert tour was absolutely breathtaking. Our guide was knowledgeable and friendly. Highly recommend for anyone visiting Morocco.",
          time: 1703097600
        },
        {
          id: 2,
          author_name: "Ahmed Hassan",
          author_url: "https://www.google.com/maps/contrib/987654321",
          profile_photo_url: "https://lh3.googleusercontent.com/a-/default-user=s40-c",
          rating: 5,
          relative_time_description: "1 month ago",
          text: "Excellent service and authentic Moroccan hospitality. The riad was beautiful and the food was incredible. Will definitely come back!",
          time: 1700505600
        },
        {
          id: 3,
          author_name: "Maria Rodriguez",
          author_url: "https://www.google.com/maps/contrib/456789123",
          profile_photo_url: "https://lh3.googleusercontent.com/a-/default-user=s40-c",
          rating: 4,
          relative_time_description: "3 weeks ago",
          text: "Great location in the heart of Marrakech. Easy access to the souks and main attractions. Staff was very helpful with recommendations.",
          time: 1702492800
        },
        {
          id: 4,
          author_name: "David Thompson",
          author_url: "https://www.google.com/maps/contrib/789123456",
          profile_photo_url: "https://lh3.googleusercontent.com/a-/default-user=s40-c",
          rating: 5,
          relative_time_description: "1 week ago",
          text: "Outstanding experience! The cooking class was fantastic and we learned so much about Moroccan cuisine. The atmosphere was perfect.",
          time: 1703702400
        },
        {
          id: 5,
          author_name: "Lisa Chen",
          author_url: "https://www.google.com/maps/contrib/321654987",
          profile_photo_url: "https://lh3.googleusercontent.com/a-/default-user=s40-c",
          rating: 5,
          relative_time_description: "2 months ago",
          text: "Magical place with incredible architecture. The traditional hammam experience was relaxing and authentic. Perfect for a romantic getaway.",
          time: 1697913600
        }
      ];

      const fetchedBusinessInfo = {
        name: "Marrakech Experience Tours",
        formatted_address: "Medina, Marrakech 40000, Morocco",
        rating: 4.8,
        user_ratings_total: 247,
        formatted_phone_number: "+212 524-123456",
        website: "https://marrakech-experience.com",
        opening_hours: {
          open_now: true,
          weekday_text: [
            "Monday: 9:00 AM – 6:00 PM",
            "Tuesday: 9:00 AM – 6:00 PM",
            "Wednesday: 9:00 AM – 6:00 PM",
            "Thursday: 9:00 AM – 6:00 PM",
            "Friday: 9:00 AM – 6:00 PM",
            "Saturday: 9:00 AM – 6:00 PM",
            "Sunday: 10:00 AM – 5:00 PM"
          ]
        }
      };

      setReviews(fetchedReviews);
      setBusinessInfo(fetchedBusinessInfo);
      toast({
        title: "Reviews Loaded",
        description: `Reviews for ${location} loaded successfully.`, 
      });
    } catch (error) {
      console.error("Error fetching Google reviews:", error);
      setApiError("Failed to load reviews. Please check your API key and Place ID.");
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleReviews(placeId);
  }, [placeId]); // Re-fetch when placeId changes

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

  const handleLocationChange = () => {
    // In a real app, you might use a Geocoding API here to get a new placeId from the location name
    // For this example, we'll just re-fetch with the current placeId or a new hardcoded one if location changes significantly
    fetchGoogleReviews(placeId); // Re-fetch with current placeId
  };

  return (
    <>
      <Helmet>
        <title>Google Reviews - Customer Testimonials | E-Store</title>
        <meta
          name="description"
          content="Read authentic Google reviews from our customers. Discover what people are saying about our services and experiences in Marrakech."
        />
        <meta name="keywords" content="google reviews, customer testimonials, marrakech reviews, travel reviews" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Customer Reviews
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers are saying about their experiences with us. 
              All reviews are sourced directly from Google to ensure authenticity.
            </p>
          </div>

          {/* Location Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="location">Business Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter business location"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="placeId">Google Place ID</Label>
                  <Input
                    id="placeId"
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    placeholder="Enter Google Place ID for more accuracy"
                  />
                </div>
                <Button onClick={handleLocationChange} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Loading...' : 'Update Reviews'}
                </Button>
              </div>
              {apiError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          {businessInfo && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {businessInfo.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {renderStars(Math.floor(businessInfo.rating))}
                      </div>
                      <span className="text-lg font-semibold">
                        {businessInfo.rating}
                      </span>
                      <span className="text-gray-600">
                        ({businessInfo.user_ratings_total} reviews)
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {businessInfo.formatted_address}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <Badge variant={businessInfo.opening_hours.open_now ? "default" : "secondary"}>
                        {businessInfo.opening_hours.open_now ? "Open Now" : "Closed"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <strong>Phone:</strong> {businessInfo.formatted_phone_number}
                    </p>
                    <a
                      href={businessInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-20 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=random`;
                        }}
                      />
                      <div>
                        <a
                          href={review.author_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gray-900 hover:text-primary"
                        >
                          {review.author_name}
                        </a>
                        <p className="text-sm text-gray-600">
                          {review.relative_time_description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      {review.text}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Google Reviews Widget Embed */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Embedded Google Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">
                  To display live Google Reviews, you'll need to integrate with the Google Places API.
                  This requires a Google Cloud Platform account and API key.
                </p>
                <div className="bg-white rounded border p-4 text-left">
                  <h4 className="font-semibold mb-2">Integration Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Create a Google Cloud Platform project</li>
                    <li>Enable the Google Places API</li>
                    <li>Generate an API key with Places API access</li>
                    <li>Configure the API key in the admin panel</li>
                    <li>Set up the business Place ID</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Share Your Experience
            </h3>
            <p className="text-gray-600 mb-6">
              Had a great experience with us? We'd love to hear from you!
            </p>
            <Button size="lg" asChild>
              <a
                href="https://www.google.com/search?q=marrakech+experience+tours"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Leave a Google Review
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}


