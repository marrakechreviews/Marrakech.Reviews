import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar, Clock, User, Search, Tag } from 'lucide-react';

const ArticlesPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marrakech-reviews-backend.vercel.app/api';

  useEffect(() => {
    fetchArticles();
  }, [currentPage, searchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        pageNumber: currentPage,
        pageSize: 9,
        ...(searchTerm && { keyword: searchTerm })
      });

      const response = await fetch(`${API_BASE_URL}/articles?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data.articles || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleArticleClick = (article) => {
    // Navigate using slug if available, otherwise use ID
    const identifier = article.slug || article._id;
    navigate(`/articles/${identifier}`);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchArticles} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Marrakech Guide | Travel Articles, Tips & Stories</title>
        <meta name="description" content="Your ultimate travel guide to Marrakech. Read our articles for the best tips, stories, and insights on what to do, where to go, and what to see in Marrakech." />
        <meta name="keywords" content="marrakech guide, marrakech travel guide, marrakech blog, marrakech tips, marrakech articles, travel to marrakech, what to do in marrakech, marrakech stories" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Articles & Blog</h1>
        <p className="text-lg text-muted-foreground">
          Discover insights, tips, and stories from our community
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No articles found.</p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <Card 
                key={article._id} 
                className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleArticleClick(article)}
              >
                {article.image && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.createdAt)}</span>
                    {article.author && (
                      <>
                        <User className="h-4 w-4 ml-2" />
                        <span>{article.author.name || 'Marrakech.Reviews'}</span>
                      </>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  {article.category && (
                    <Badge variant="secondary" className="w-fit">
                      {article.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4">
                    {truncateContent(article.content.replace(/<[^>]*>/g, ''))}
                  </CardDescription>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    handleArticleClick(article);
                  }}>
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default ArticlesPage;

