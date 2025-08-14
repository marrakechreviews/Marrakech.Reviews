import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Search, 
  Globe, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Smartphone,
  Monitor
} from 'lucide-react';

const SeoTools = ({ 
  title = '', 
  metaTitle = '', 
  metaDescription = '', 
  keywords = [], 
  content = '',
  slug = '',
  onTitleChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onKeywordsChange,
  onSlugChange
}) => {
  const [seoScore, setSeoScore] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState({});
  const [keywordInput, setKeywordInput] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');

  // SEO Analysis
  const analysis = useMemo(() => {
    const results = {
      title: analyzeTitle(title, metaTitle),
      description: analyzeDescription(metaDescription),
      keywords: analyzeKeywords(keywords, content, focusKeyword),
      content: analyzeContent(content, focusKeyword),
      slug: analyzeSlug(slug),
      readability: analyzeReadability(content)
    };

    // Calculate overall score
    const scores = Object.values(results).map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    setSeoScore(Math.round(avgScore));
    setSeoAnalysis(results);

    return results;
  }, [title, metaTitle, metaDescription, keywords, content, slug, focusKeyword]);

  function analyzeTitle(title, metaTitle) {
    const titleToAnalyze = metaTitle || title;
    const length = titleToAnalyze.length;
    let score = 0;
    const issues = [];
    const suggestions = [];

    if (length === 0) {
      issues.push('Title is missing');
    } else if (length < 30) {
      issues.push('Title is too short');
      suggestions.push('Consider making your title longer (30-60 characters)');
      score = 30;
    } else if (length > 60) {
      issues.push('Title is too long');
      suggestions.push('Consider shortening your title (30-60 characters)');
      score = 60;
    } else {
      score = 100;
    }

    if (focusKeyword && titleToAnalyze.toLowerCase().includes(focusKeyword.toLowerCase())) {
      score = Math.min(100, score + 20);
    } else if (focusKeyword) {
      suggestions.push(`Consider including your focus keyword "${focusKeyword}" in the title`);
    }

    return {
      score,
      length,
      issues,
      suggestions,
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error'
    };
  }

  function analyzeDescription(description) {
    const length = description.length;
    let score = 0;
    const issues = [];
    const suggestions = [];

    if (length === 0) {
      issues.push('Meta description is missing');
    } else if (length < 120) {
      issues.push('Meta description is too short');
      suggestions.push('Consider making your meta description longer (120-160 characters)');
      score = 40;
    } else if (length > 160) {
      issues.push('Meta description is too long');
      suggestions.push('Consider shortening your meta description (120-160 characters)');
      score = 60;
    } else {
      score = 100;
    }

    if (focusKeyword && description.toLowerCase().includes(focusKeyword.toLowerCase())) {
      score = Math.min(100, score + 15);
    } else if (focusKeyword) {
      suggestions.push(`Consider including your focus keyword "${focusKeyword}" in the meta description`);
    }

    return {
      score,
      length,
      issues,
      suggestions,
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error'
    };
  }

  function analyzeKeywords(keywords, content, focusKeyword) {
    let score = 0;
    const issues = [];
    const suggestions = [];

    if (keywords.length === 0) {
      issues.push('No keywords defined');
      suggestions.push('Add relevant keywords to improve SEO');
    } else if (keywords.length < 3) {
      suggestions.push('Consider adding more keywords (3-8 recommended)');
      score = 50;
    } else if (keywords.length > 10) {
      issues.push('Too many keywords');
      suggestions.push('Focus on 3-8 most relevant keywords');
      score = 60;
    } else {
      score = 80;
    }

    if (focusKeyword) {
      const keywordDensity = calculateKeywordDensity(content, focusKeyword);
      if (keywordDensity < 0.5) {
        suggestions.push(`Focus keyword "${focusKeyword}" appears rarely in content (${keywordDensity.toFixed(1)}%)`);
      } else if (keywordDensity > 3) {
        issues.push(`Focus keyword "${focusKeyword}" may be overused (${keywordDensity.toFixed(1)}%)`);
      } else {
        score = Math.min(100, score + 20);
      }
    }

    return {
      score,
      count: keywords.length,
      density: focusKeyword ? calculateKeywordDensity(content, focusKeyword) : 0,
      issues,
      suggestions,
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error'
    };
  }

  function analyzeContent(content, focusKeyword) {
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    let score = 0;
    const issues = [];
    const suggestions = [];

    if (wordCount === 0) {
      issues.push('Content is empty');
    } else if (wordCount < 300) {
      issues.push('Content is too short');
      suggestions.push('Consider writing more comprehensive content (300+ words)');
      score = 30;
    } else if (wordCount < 600) {
      suggestions.push('Consider expanding your content for better SEO');
      score = 70;
    } else {
      score = 90;
    }

    // Check for headings
    const headingCount = (content.match(/<h[1-6][^>]*>/gi) || []).length;
    if (headingCount === 0) {
      suggestions.push('Add headings (H1, H2, H3) to structure your content');
    } else {
      score = Math.min(100, score + 10);
    }

    return {
      score,
      wordCount,
      headingCount,
      issues,
      suggestions,
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error'
    };
  }

  function analyzeSlug(slug) {
    let score = 0;
    const issues = [];
    const suggestions = [];

    if (!slug) {
      issues.push('URL slug is missing');
    } else if (slug.length > 60) {
      issues.push('URL slug is too long');
      suggestions.push('Keep URL slug under 60 characters');
      score = 50;
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      issues.push('URL slug contains invalid characters');
      suggestions.push('Use only lowercase letters, numbers, and hyphens');
      score = 40;
    } else {
      score = 90;
    }

    if (focusKeyword && slug.includes(focusKeyword.toLowerCase().replace(/\s+/g, '-'))) {
      score = Math.min(100, score + 10);
    } else if (focusKeyword) {
      suggestions.push(`Consider including your focus keyword in the URL slug`);
    }

    return {
      score,
      length: slug.length,
      issues,
      suggestions,
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error'
    };
  }

  function analyzeReadability(content) {
    const textContent = content.replace(/<[^>]*>/g, '');
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return { score: 0, issues: ['No content to analyze'], suggestions: [], status: 'error' };
    }

    const avgWordsPerSentence = words.length / sentences.length;
    let score = 0;
    const issues = [];
    const suggestions = [];

    if (avgWordsPerSentence > 25) {
      issues.push('Sentences are too long on average');
      suggestions.push('Try to keep sentences under 20 words for better readability');
      score = 40;
    } else if (avgWordsPerSentence > 20) {
      suggestions.push('Consider shortening some sentences for better readability');
      score = 70;
    } else {
      score = 90;
    }

    return {
      score,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      sentenceCount: sentences.length,
      issues,
      suggestions,
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error'
    };
  }

  function calculateKeywordDensity(content, keyword) {
    if (!keyword || !content) return 0;
    const textContent = content.replace(/<[^>]*>/g, '').toLowerCase();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    const keywordCount = textContent.split(keyword.toLowerCase()).length - 1;
    return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
  }

  const handleKeywordAdd = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      onKeywordsChange(newKeywords);
      setKeywordInput('');
    }
  };

  const handleKeywordRemove = (keywordToRemove) => {
    const newKeywords = keywords.filter(k => k !== keywordToRemove);
    onKeywordsChange(newKeywords);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={seoScore} className="h-3" />
            </div>
            <Badge 
              variant={seoScore >= 80 ? "default" : seoScore >= 50 ? "secondary" : "destructive"}
              className="text-lg px-3 py-1"
            >
              {seoScore}/100
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {seoScore >= 80 ? 'Excellent SEO optimization!' : 
             seoScore >= 50 ? 'Good SEO, but there\'s room for improvement.' : 
             'SEO needs significant improvement.'}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic SEO</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Focus Keyword */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Focus Keyword
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="focus-keyword">Primary Focus Keyword</Label>
                  <Input
                    id="focus-keyword"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="Enter your main keyword..."
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The main keyword you want this article to rank for.
                  </p>
                </div>
                {focusKeyword && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Keyword Density:</strong> {analysis.keywords.density.toFixed(1)}%
                      <span className="ml-2 text-muted-foreground">
                        (Recommended: 0.5% - 3%)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meta Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(analysis.title.status)}
                Meta Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meta-title">Meta Title</Label>
                  <Input
                    id="meta-title"
                    value={metaTitle}
                    onChange={(e) => onMetaTitleChange(e.target.value)}
                    placeholder="Enter meta title (leave empty to use article title)..."
                    maxLength={60}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Appears in search results and browser tabs</span>
                    <span className={analysis.title.length > 60 ? 'text-red-500' : ''}>
                      {analysis.title.length}/60
                    </span>
                  </div>
                </div>
                {analysis.title.issues.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {analysis.title.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                {analysis.title.suggestions.length > 0 && (
                  <div className="text-sm text-blue-600">
                    <strong>Suggestions:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.title.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meta Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(analysis.description.status)}
                Meta Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meta-description">Meta Description</Label>
                  <Textarea
                    id="meta-description"
                    value={metaDescription}
                    onChange={(e) => onMetaDescriptionChange(e.target.value)}
                    placeholder="Enter a compelling description for search results..."
                    maxLength={160}
                    rows={3}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Appears in search results below the title</span>
                    <span className={analysis.description.length > 160 ? 'text-red-500' : ''}>
                      {analysis.description.length}/160
                    </span>
                  </div>
                </div>
                {analysis.description.issues.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {analysis.description.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                {analysis.description.suggestions.length > 0 && (
                  <div className="text-sm text-blue-600">
                    <strong>Suggestions:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.description.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* URL Slug */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(analysis.slug.status)}
                URL Slug
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                    placeholder="url-friendly-slug"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>The URL path for this article</span>
                    <span>{analysis.slug.length} characters</span>
                  </div>
                </div>
                {analysis.slug.issues.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {analysis.slug.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                {analysis.slug.suggestions.length > 0 && (
                  <div className="text-sm text-blue-600">
                    <strong>Suggestions:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.slug.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(analysis.keywords.status)}
                Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add a keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
                  />
                  <button
                    type="button"
                    onClick={handleKeywordAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleKeywordRemove(keyword)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {analysis.keywords.suggestions.length > 0 && (
                  <div className="text-sm text-blue-600">
                    <strong>Suggestions:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.keywords.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(analysis.content.status)}
                Content Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Word Count</p>
                  <p className="text-2xl font-bold">{analysis.content.wordCount}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Headings</p>
                  <p className="text-2xl font-bold">{analysis.content.headingCount}</p>
                </div>
              </div>
              {analysis.content.issues.length > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {analysis.content.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {analysis.content.suggestions.length > 0 && (
                <div className="text-sm text-blue-600">
                  <strong>Suggestions:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {analysis.content.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Readability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(analysis.readability.status)}
                Readability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Average Words per Sentence</p>
                  <p className="text-2xl font-bold">{analysis.readability.avgWordsPerSentence}</p>
                  <p className="text-sm text-muted-foreground">Recommended: Under 20 words</p>
                </div>
                {analysis.readability.issues.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {analysis.readability.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                {analysis.readability.suggestions.length > 0 && (
                  <div className="text-sm text-blue-600">
                    <strong>Suggestions:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.readability.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {/* Search Result Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Result Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Desktop Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-4 w-4" />
                    <span className="font-medium">Desktop</span>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {metaTitle || title || 'Article Title'}
                    </div>
                    <div className="text-green-700 text-sm">
                      https://Marrakech.Reviews/articles/{slug || 'article-slug'}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {metaDescription || 'Meta description will appear here...'}
                    </div>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">Mobile</span>
                  </div>
                  <div className="border rounded-lg p-3 bg-white max-w-sm">
                    <div className="text-blue-600 text-base hover:underline cursor-pointer leading-tight">
                      {(metaTitle || title || 'Article Title').substring(0, 50)}
                      {(metaTitle || title || '').length > 50 && '...'}
                    </div>
                    <div className="text-green-700 text-xs mt-1">
                    Marrakech.Reviews › articles › {slug || 'article-slug'}
                    </div>
                    <div className="text-gray-600 text-sm mt-1 leading-tight">
                      {(metaDescription || 'Meta description will appear here...').substring(0, 120)}
                      {(metaDescription || '').length > 120 && '...'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Featured Image</span>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-gray-900 mb-1">
                    {metaTitle || title || 'Article Title'}
                  </div>
                  <div className="text-gray-600 text-sm mb-2">
                    {metaDescription || 'Meta description will appear here...'}
                  </div>
                  <div className="text-gray-500 text-xs uppercase">
                  Marrakech.Reviews
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeoTools;

