import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Instagram,
  Play,
  Heart,
  MessageCircle,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const InstagramSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedVideos();
  }, []);

  const fetchFeaturedVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/instagram/featured?limit=6`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        setError('Failed to load Instagram videos');
      }
    } catch (error) {
      console.error('Error fetching Instagram videos:', error);
      setError('Failed to load Instagram videos');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, videos.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, videos.length - 2)) % Math.max(1, videos.length - 2));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || videos.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Instagram className="h-12 w-12 text-pink-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Follow Our Instagram Journey
          </h2>
          <p className="text-gray-600 mb-8">
            {error || 'No videos available at the moment. Check back soon!'}
          </p>
          <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <a 
              href="https://www.instagram.com/marrakechreviews/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Visit Our Instagram
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Instagram className="h-12 w-12 text-pink-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Follow Our Instagram Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover the beauty of Marrakech through our lens. Get inspired by our latest adventures, 
            hidden gems, and authentic experiences.
          </p>
          <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <a 
              href="https://www.instagram.com/marrakechreviews/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Instagram className="mr-2 h-5 w-5" />
              See All Videos
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Video Grid */}
        <div className="relative">
          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(0, 6).map((video) => (
              <InstagramVideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {videos.map((video) => (
                  <div key={video._id} className="w-full flex-shrink-0 px-2">
                    <InstagramVideoCard video={video} />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            {videos.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label="Next video"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center mt-4 space-x-2">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentIndex ? 'bg-pink-500' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to video ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Want to see more? Follow us for daily updates and exclusive content!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              asChild
              className="border-pink-500 text-pink-500 hover:bg-pink-50"
            >
              <a 
                href="https://www.instagram.com/marrakechreviews/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Instagram className="mr-2 h-4 w-4" />
                Follow @marrakechreviews
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Instagram Video Card Component
const InstagramVideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleVideoClick = () => {
    window.open(video.instagramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVideoClick}
    >
      <div className="relative aspect-square overflow-hidden">
        {/* Thumbnail */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Play className="h-8 w-8 text-white fill-current" />
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {video.category}
          </Badge>
        </div>

        {/* Duration */}
        {video.duration && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {video.formattedDuration}
            </Badge>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{formatNumber(video.likes)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(video.comments)}</span>
              </div>
              {video.views > 0 && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{formatNumber(video.views)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {video.description}
          </p>
        )}
        {video.location?.name && (
          <div className="flex items-center text-xs text-gray-500">
            <span>📍 {video.location.name}</span>
            {video.location.city && (
              <span>, {video.location.city}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export default InstagramSection;

