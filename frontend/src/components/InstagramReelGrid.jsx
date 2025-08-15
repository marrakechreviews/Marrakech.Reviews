import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';

const InstagramReelGrid = ({ 
  title = "Featured Reels",
  limit = 6,
  featured = true,
  className = ""
}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [featured]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: limit,
        active: 'true',
        ...(featured !== null && { featured: featured.toString() })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/instagram?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching Instagram videos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openInstagramVideo = (instagramUrl) => {
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="grid grid-cols-3 gap-0 justify-center mx-auto max-w-fit">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="aspect-[9/16] bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">Error loading videos: {error}</p>
            <Button 
              onClick={fetchVideos} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">No videos found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {title && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch our latest Instagram reels and stories
          </p>
        </div>
      )}

      {/* Reels Grid */}
      <div className="grid grid-cols-3 gap-0 justify-center mx-auto max-w-fit">
        {videos.map((video) => (
          <div 
            key={video._id} 
            className="relative aspect-[9/16] group cursor-pointer overflow-hidden rounded-lg bg-black"
            onClick={() => openInstagramVideo(video.instagramUrl)}
          >
            {/* Thumbnail */}
            <div className="absolute inset-0">
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white bg-opacity-20 rounded-full p-3 backdrop-blur-sm">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="space-y-2">
                  {/* Title */}
                  <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center space-x-3">
                      {video.likes > 0 && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{video.likes > 1000 ? `${(video.likes/1000).toFixed(1)}k` : video.likes}</span>
                        </div>
                      )}
                      {video.comments > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{video.comments > 1000 ? `${(video.comments/1000).toFixed(1)}k` : video.comments}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Category Badge */}
                    {video.category && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-white/20 text-white border-white/30">
                        {video.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Right Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add share functionality here
                  }}
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>

              {/* Featured Badge */}
              {video.featured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1">
                    ⭐ Featured
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      {videos.length >= limit && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="border-purple-500 text-purple-500 hover:bg-purple-50"
            onClick={() => window.location.href = '/instagram'}
          >
            View All Reels
          </Button>
        </div>
      )}
    </div>
  );
};

export default InstagramReelGrid;

