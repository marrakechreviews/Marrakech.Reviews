import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ArrowLeft, 
  Share2, 
  BookOpen, 
  Heart,
  MessageCircle,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  ChevronUp,
  Eye,
  TrendingUp,
  Coffee,
  Lightbulb,
  Quote
} from 'lucide-react';
import { toast } from 'sonner';

const ModernArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const contentRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchArticle();
    fetchRelatedArticles();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(Math.min(progress, 100));
        setShowScrollTop(scrollTop > 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      let response = await fetch(`${API_BASE_URL}/articles/slug/${slug}`);
      
      if (response.ok) {
        const foundArticle = await response.json();
        setArticle(foundArticle);
        setEstimatedReadTime(calculateReadTime(foundArticle.content));
      } else {
        response = await fetch(`${API_BASE_URL}/articles/${slug}`);
        if (response.ok) {
          const foundArticle = await response.json();
          setArticle(foundArticle);
          setEstimatedReadTime(calculateReadTime(foundArticle.content));
        } else {
          setError('Article not found');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/articles?limit=3&isPublished=true`);
      if (response.ok) {
        const data = await response.json();
        setRelatedArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to fetch related articles:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = async (platform = 'native') => {
    const url = window.location.href;
    const title = article.title;
    const text = article.metaDescription || 'Check out this article';

    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch (err) {
            console.log('Error sharing:', err);
          }
        } else {
          handleShare('copy');
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Article URL copied to clipboard!');
        break;
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Article bookmarked');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            
            {/* Image skeleton */}
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">
              {error || 'The article you are looking for does not exist.'}
            </p>
            <Button onClick={() => navigate('/articles')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={readingProgress} className="h-1 rounded-none" />
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 z-40 flex flex-col gap-3">
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white text-gray-700 hover:bg-gray-50"
            variant="outline"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
        <Button
          onClick={handleLike}
          size="icon"
          className={`rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
            isLiked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          variant={isLiked ? "default" : "outline"}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        <Button
          onClick={handleBookmark}
          size="icon"
          className={`rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
            isBookmarked ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          variant={isBookmarked ? "default" : "outline"}
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/articles')}
          className="mb-8 hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>

        {/* Article Header */}
        <header className="mb-12">
          {/* Category Badge */}
          {article.category && (
            <div className="mb-6">
              <Badge 
                variant="secondary" 
                className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {article.category}
              </Badge>
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Subtitle/Meta Description */}
          {article.metaDescription && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light">
              {article.metaDescription}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{formatDate(article.createdAt)}</span>
            </div>
            
            {article.author && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                <User className="h-4 w-4 text-green-500" />
                <span className="font-medium">{article.author.name || 'Marrakech.Reviews'}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{estimatedReadTime} min read</span>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="font-medium">{article.isPublished ? 'Published' : 'Draft'}</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm font-medium text-gray-700">Share:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <Twitter className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('copy')}
                className="hover:bg-gray-50 hover:border-gray-200 transition-colors"
              >
                <Link2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.image && (
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <Card className="mb-12 shadow-xl border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Article Content</h3>
                  <p className="text-sm text-gray-600">Estimated reading time: {estimatedReadTime} minutes</p>
                </div>
              </div>
            </div>
            
            <div 
              ref={contentRef}
              className="prose prose-lg max-w-none p-8 prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-gray-700 prose-blockquote:font-medium prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <Card className="mb-12 shadow-lg border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                {article.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <Card className="mb-12 shadow-lg border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.slice(0, 3).map((relatedArticle) => (
                  <Card 
                    key={relatedArticle._id} 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md"
                    onClick={() => navigate(`/articles/${relatedArticle.slug || relatedArticle._id}`)}
                  >
                    <CardContent className="p-6">
                      {relatedArticle.image && (
                        <img 
                          src={relatedArticle.image} 
                          alt={relatedArticle.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {relatedArticle.metaDescription || 
                         relatedArticle.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(relatedArticle.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Article Footer */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Published on {formatDate(article.createdAt)}
                </p>
                {article.updatedAt !== article.createdAt && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last updated on {formatDate(article.updatedAt)}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleShare('native')}
                  className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </Button>
                <Button 
                  onClick={handleLike}
                  className={`transition-all duration-300 ${
                    isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-12 shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Enjoyed this article?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to get the latest articles and insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/articles')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Read More Articles
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 transition-colors"
                onClick={() => handleShare('native')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share with Friends
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernArticleDetailPage;

