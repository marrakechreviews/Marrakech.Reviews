import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

const InstagramVideoEmbed = ({ video, showThumbnail = true, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(false);

  if (!video || !video.embedUrl) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No video available</p>
      </div>
    );
  }

  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!isPlaying && showThumbnail) {
    return (
      <div className="relative w-full group cursor-pointer" onClick={handlePlay}>
        <div className="relative overflow-hidden rounded-lg bg-black">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              style={{ aspectRatio: '9/16' }}
            />
          ) : (
            <div 
              className="w-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center"
              style={{ aspectRatio: '9/16' }}
            >
              <div className="text-white text-center">
                <Play className="w-16 h-16 mx-auto mb-2" />
                <p className="text-lg font-semibold">{video.title}</p>
              </div>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white bg-opacity-90 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-gray-800 fill-current" />
            </div>
          </div>

          {/* Video info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
              {video.title}
            </h3>
            {video.location?.name && (
              <p className="text-white text-xs opacity-80">
                📍 {video.location.name}
              </p>
            )}
          </div>

          {/* Instagram badge */}
          <div className="absolute top-2 right-2">
            <a
              href={video.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 hover:from-purple-600 hover:to-pink-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      <div className="relative overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '9/16' }}>
        <iframe
          src={video.embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          title={video.title}
          onLoad={handleIframeLoad}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Video info below iframe */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-gray-600 text-xs line-clamp-2 mb-2">
            {video.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {video.likes > 0 && (
              <span className="flex items-center space-x-1">
                <span>❤️</span>
                <span>{video.likes.toLocaleString()}</span>
              </span>
            )}
            {video.comments > 0 && (
              <span className="flex items-center space-x-1">
                <span>💬</span>
                <span>{video.comments.toLocaleString()}</span>
              </span>
            )}
          </div>
          <a
            href={video.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 transition-colors"
          >
            View on Instagram
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstagramVideoEmbed;

