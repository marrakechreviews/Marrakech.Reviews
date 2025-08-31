import React, { useState, useEffect } from 'react';
import InstagramVideoEmbed from './InstagramVideoEmbed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Search from 'lucide-react/dist/esm/icons/search';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Grid from 'lucide-react/dist/esm/icons/grid';
import List from 'lucide-react/dist/esm/icons/list';

const InstagramVideoGrid = ({ 
  title = "Our Instagram Videos",
  showFilters = true,
  showSearch = true,
  limit = 12,
  category = null,
  featured = null,
  className = ""
}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(category || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food' },
    { value: 'culture', label: 'Culture' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'tips', label: 'Tips' },
    { value: 'reviews', label: 'Reviews' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchVideos();
  }, [currentPage, categoryFilter, searchTerm, featured]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        active: 'true', // Only fetch active videos for frontend
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(featured !== null && { featured: featured.toString() }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/instagram?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();

      if (data.success) {
        setVideos(data.data);
        setTotalPages(data.pagination.pages);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVideos();
  };

  if (loading && videos.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading videos...</p>
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
            {(searchTerm || categoryFilter !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setCurrentPage(1);
                }} 
                className="mt-4"
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our latest adventures and experiences through our Instagram videos
        </p>
      </div>

      {/* Filters */}
      {(showFilters || showSearch) && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {showSearch && (
              <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </form>
            )}
            
            {showFilters && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Videos Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-3 gap-0 justify-center mx-auto max-w-fit"
          : "space-y-6"
      }>
        {videos.map((video) => (
          <div key={video._id} className={
            viewMode === 'list' 
              ? "flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              : ""
          }>
            <div className={viewMode === 'list' ? "sm:w-64 flex-shrink-0" : ""}>
              <InstagramVideoEmbed 
                video={video} 
                showThumbnail={true}
                autoPlay={false}
              />
            </div>
            
            {viewMode === 'list' && (
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {video.title}
                  </h3>
                  <Badge variant="outline" className="ml-2">
                    {video.category}
                  </Badge>
                </div>
                
                {video.description && (
                  <p className="text-gray-600 line-clamp-3">
                    {video.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                  {video.location?.name && (
                    <span>📍 {video.location.name}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default InstagramVideoGrid;

