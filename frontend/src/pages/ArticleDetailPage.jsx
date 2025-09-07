import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articlesAPI, reviewsAPI } from '../lib/api';
import { Badge } from '../components/ui/badge';
import ReviewsList from '../components/ReviewsList';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import User from 'lucide-react/dist/esm/icons/user';
import Tag from 'lucide-react/dist/esm/icons/tag';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import { Helmet } from 'react-helmet-async';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => articlesAPI.getArticleBySlug(slug),
    select: (response) => response.data,
    retry: (failureCount, error) => {
      return error.response?.status !== 404 && failureCount < 2;
    }
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', 'article', article?._id],
    queryFn: () => reviewsAPI.getReviews({ refId: article._id, refModel: 'Article' }),
    select: (response) => response.data.data,
    enabled: !!article,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = textContent.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.metaDescription || 'Check out this article',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || 'The article you are looking for does not exist.'}
          </p>
          <Button onClick={() => navigate('/articles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  const articleSchema = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author ? article.author.name : "Marrakech.Reviews"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Marrakech.Reviews",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.marrakech.reviews/logo.png"
      }
    },
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.marrakech.reviews/articles/${article.slug}`
    }
  } : null;

  const title = article ? article.metaTitle || article.title : 'Article';
  const description = article ? article.metaDescription || article.content.substring(0, 160) : 'Loading article...';
  const keywords = article && article.keywords ? article.keywords.join(', ') : '';
  const image = article ? article.image : '';
  const url = article ? `https://www.marrakech.reviews/articles/${article.slug}` : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        {url && <link rel="canonical" href={url} />}

        {/* Open Graph tags */}
        {url && <meta property="og:url" content={url} />}
        {title && <meta property="og:title" content={title} />}
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="article" />
        {image && <meta property="og:image" content={image} />}

        {/* Twitter Card tags */}
        {title && <meta name="twitter:title" content={title} />}
        {description && <meta name="twitter:description" content={description} />}
        {image && <meta name="twitter:image" content={image} />}

        {articleSchema && (
          <script type="application/ld+json">
            {JSON.stringify(articleSchema)}
          </script>
        )}
      </Helmet>
      <Button
        variant="ghost"
        onClick={() => navigate('/articles')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Articles
      </Button>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {article.category && (
            <Badge variant="secondary" className="mb-2">
              {article.category}
            </Badge>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {article.metaDescription && (
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {article.metaDescription}
          </p>
        )}

        {/* Article Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
          
          {article.author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author.name || 'Marrakech.Reviews'}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{calculateReadTime(article.content)} min read</span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{article.isPublished ? 'Published' : 'Draft'}</span>
          </div>
        </div>

        {/* Share Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Article
          </Button>
        </div>
      </header>

      {/* Featured Image */}
      {article.image && (
        <div className="mb-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-strong:text-gray-900 prose-code:text-primary prose-pre:bg-gray-50 prose-blockquote:border-primary prose-blockquote:text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
      </Card>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8">
        <ReviewsList reviews={reviews} isLoading={reviewsLoading} />
      </div>

      {/* Article Footer */}
      <footer className="border-t pt-8 mt-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Published on {formatDate(article.createdAt)}
            </p>
            {article.updatedAt !== article.createdAt && (
              <p className="text-sm text-muted-foreground">
                Last updated on {formatDate(article.updatedAt)}
              </p>
            )}
          </div>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ArticleDetailPage;

