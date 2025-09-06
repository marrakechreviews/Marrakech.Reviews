import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import BlockRenderer from '../components/BlockRenderer';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import User from 'lucide-react/dist/esm/icons/user';
import Tag from 'lucide-react/dist/esm/icons/tag';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Heart from 'lucide-react/dist/esm/icons/heart';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Bookmark from 'lucide-react/dist/esm/icons/bookmark';
import Twitter from 'lucide-react/dist/esm/icons/twitter';
import Facebook from 'lucide-react/dist/esm/icons/facebook';
import Linkedin from 'lucide-react/dist/esm/icons/linkedin';
import Link2 from 'lucide-react/dist/esm/icons/link-2';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import Eye from 'lucide-react/dist/esm/icons/eye';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Coffee from 'lucide-react/dist/esm/icons/coffee';
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb';
import Quote from 'lucide-react/dist/esm/icons/quote';
import Palette from 'lucide-react/dist/esm/icons/palette';
import Layout from 'lucide-react/dist/esm/icons/layout';
import Zap from 'lucide-react/dist/esm/icons/zap';
import { toast } from 'sonner';
import { optimizeImage } from '../lib/image';

const EnhancedArticleDetailPage = () => {
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
  const [contentType, setContentType] = useState('html'); // 'html' or 'blocks'
  const contentRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marrakech-reviews-backend.vercel.app/api';

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
        detectContentType(foundArticle.content);
      } else {
        response = await fetch(`${API_BASE_URL}/articles/${slug}`);
        if (response.ok) {
          const foundArticle = await response.json();
          setArticle(foundArticle);
          setEstimatedReadTime(calculateReadTime(foundArticle.content));
          detectContentType(foundArticle.content);
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

  const detectContentType = (content) => {
    try {
      // Try to parse as JSON to see if it's block-based content
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        setContentType('blocks');
        return;
      }
    } catch (e) {
      // Not JSON, treat as HTML
    }
    
    // Check if content looks like it might be from the Shopify-like editor
    if (content.includes('block_') || content.includes('data-block-type')) {
      setContentType('blocks');
    } else {
      setContentType('html');
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
    const textContent = content.replace(/<[^>]*>/g, '').replace(/[{}[\]"]/g, '');
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="space-y-6">
              <div className="h-6 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-32"></div>
              <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-4/5"></div>
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/5"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full w-28"></div>
                <div className="h-10 bg-gradient-to-r from-green-200 to-green-300 rounded-full w-24"></div>
                <div className="h-10 bg-gradient-to-r from-orange-200 to-orange-300 rounded-full w-20"></div>
              </div>
            </div>
            
            {/* Image skeleton */}
            <div className="h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl shadow-2xl"></div>
            
            {/* Content skeleton */}
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-5/6"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-4/6"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Article Not Found
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error || 'The article you are looking for does not exist or has been moved.'}
            </p>
            <Button 
              onClick={() => navigate('/articles')} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Articles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform origin-left transition-transform duration-300" 
             style={{ transform: `scaleX(${readingProgress / 100})` }}>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 z-40 flex flex-col gap-4">
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 hover:scale-110"
            variant="outline"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
        <Button
          onClick={handleLike}
          size="icon"
          className={`rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 ${
            isLiked 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
          }`}
          variant={isLiked ? "default" : "outline"}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        <Button
          onClick={handleBookmark}
          size="icon"
          className={`rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 ${
            isBookmarked 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
          }`}
          variant={isBookmarked ? "default" : "outline"}
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/articles')}
          className="mb-8 hover:bg-white/80 hover:shadow-lg transition-all duration-300 rounded-xl backdrop-blur-sm"
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
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-200 hover:to-purple-200 transition-all duration-300 border-0"
              >
                <Tag className="h-3 w-3 mr-1" />
                {article.category}
              </Badge>
            </div>
          )}
          
          {/* Content Type Indicator */}
          <div className="mb-4">
            <Badge 
              variant="outline" 
              className={`px-3 py-1 text-xs font-medium border-0 ${
                contentType === 'blocks' 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                  : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800'
              }`}
            >
              {contentType === 'blocks' ? (
                <>
                  <Palette className="h-3 w-3 mr-1" />
                  Enhanced Content
                </>
              ) : (
                <>
                  <Layout className="h-3 w-3 mr-1" />
                  Standard Content
                </>
              )}
            </Badge>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Subtitle/Meta Description */}
          {article.metaDescription && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light">
              {article.metaDescription}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{formatDate(article.createdAt)}</span>
            </div>
            
            {article.author && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <User className="h-4 w-4 text-green-500" />
                <span className="font-medium">{article.author.name || 'Marrakech.Reviews'}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{estimatedReadTime} min read</span>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="font-medium">{article.isPublished ? 'Published' : 'Draft'}</span>
            </div>

            {contentType === 'blocks' && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full shadow-sm border border-green-200">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Enhanced</span>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm font-medium text-gray-700">Share:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 border-gray-200"
              >
                <Twitter className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 border-gray-200"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 border-gray-200"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('copy')}
                className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 border-gray-200"
              >
                <Link2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.image && (
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img
                src={optimizeImage(article.image, 800)}
                alt={article.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <Card className="mb-12 shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {contentType === 'blocks' ? (
                    <Palette className="h-6 w-6 text-white" />
                  ) : (
                    <Lightbulb className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {contentType === 'blocks' ? 'Enhanced Article Content' : 'Article Content'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {contentType === 'blocks' 
                      ? `Block-based content • ${estimatedReadTime} min read`
                      : `Traditional content • ${estimatedReadTime} min read`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              ref={contentRef}
              className="p-8"
            >
              <BlockRenderer content={article.content} />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <Card className="mb-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                    className="px-4 py-2 text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer border-gray-200 hover:border-blue-300"
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
          <Card className="mb-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-md bg-white/90 backdrop-blur-sm group"
                    onClick={() => navigate(`/articles/${relatedArticle.slug || relatedArticle._id}`)}
                  >
                    <CardContent className="p-6">
                      {relatedArticle.image && (
                        <div className="relative overflow-hidden rounded-lg mb-4">
                          <img 
                            src={optimizeImage(relatedArticle.image, 400)}
                            alt={relatedArticle.title}
                            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {relatedArticle.metaDescription || 
                         relatedArticle.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
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
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                {contentType === 'blocks' && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Created with enhanced editor
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleShare('native')}
                  className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 border-gray-200"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </Button>
                <Button 
                  onClick={handleLike}
                  className={`transition-all duration-300 border-0 ${
                    isLiked 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                      : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700'
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
        <Card className="mt-12 shadow-lg border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
          <CardContent className="p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Enjoyed this article?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                {contentType === 'blocks' 
                  ? 'This article was created with our enhanced block-based editor. Discover more beautifully crafted content and insights.'
                  : 'Subscribe to our newsletter to get the latest articles and insights delivered to your inbox.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button 
                  variant="secondary" 
                  className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 border-0"
                  onClick={() => navigate('/articles')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read More Articles
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                  onClick={() => handleShare('native')}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Friends
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedArticleDetailPage;

