import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Eye,
  EyeOff,
  Filter,
  Download,
  Upload,
  Star,
  Image as ImageIcon,
  Calendar,
  User,
  Tag,
  Globe,
  Settings,
  Code,
  Save,
  ArrowLeft,
  Sparkles,
  Link,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { articlesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import TinyMCEEditor from '../components/TinyMCEEditor';
import QuillEditor from '../components/QuillEditor';

const ArticlesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorType, setEditorType] = useState('tinymce');
  const [previewMode, setPreviewMode] = useState(false);
  const [aiUrls, setAiUrls] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    image: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    isPublished: false
  });

  const queryClient = useQueryClient();

  // Enable bypass mode on component mount
  useEffect(() => {
    const bypassMode = localStorage.getItem('bypassLogin');
    if (bypassMode !== 'true') {
      console.log('🔧 Enabling bypass mode...');
      localStorage.setItem('bypassLogin', 'true');
      
      const mockAdminUser = {
        _id: 'bypass-admin',
        name: 'Bypass Admin',
        email: 'admin@bypass.com',
        role: 'admin',
        isActive: true
      };
      
      localStorage.setItem('adminUser', JSON.stringify(mockAdminUser));
      console.log('✅ Bypass mode enabled!');
    }
  }, []);

  // Fetch articles with enhanced error handling and refetch
  const { data: articlesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['articles', { search: searchTerm, category: categoryFilter, status: statusFilter, sort: sortBy }],
    queryFn: () => {
      console.log('🔍 Fetching articles with params:', {
        keyword: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        isPublished: statusFilter !== 'all' ? statusFilter === 'published' : undefined,
        sort: sortBy,
        limit: 50
      });
      
      return articlesAPI.getArticles({
        keyword: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        isPublished: statusFilter !== 'all' ? statusFilter === 'published' : undefined,
        sort: sortBy,
        limit: 50
      }).then(res => {
        console.log('📦 Articles response:', res.data);
        return res.data;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  const articles = articlesResponse?.articles || [];
  const totalArticles = articles.length;

  // Create article mutation with enhanced error handling and debugging
  const createMutation = useMutation({
    mutationFn: (articleData) => {
      console.log('🚀 Creating article with data:', articleData);
      
      // Validate data before sending
      const requiredFields = ['title', 'content'];
      const missingFields = requiredFields.filter(field => {
        const value = articleData[field];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate content length
      if (articleData.content.trim().length < 50) {
        console.error('❌ Content too short:', articleData.content.length);
        throw new Error('Article content must be at least 50 characters long');
      }
      
      console.log('✅ Data validation passed, sending to API...');
      return articlesAPI.createArticle(articleData);
    },
    onSuccess: (response) => {
      console.log('✅ Article created successfully:', response);
      // Force refetch articles
      queryClient.invalidateQueries(['articles']);
      refetch();
      setIsCreateDialogOpen(false);
      setShowEditor(false);
      resetForm();
      toast.success('Article created successfully and published to website');
    },
    onError: (error) => {
      console.error('❌ Create article error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create article';
      
      if (error?.response?.data) {
        console.log('📋 Server response:', error.response.data);
        
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.log('📢 Showing error to user:', errorMessage);
      toast.error(errorMessage);
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🔄 Updating article:', id, 'with data:', data);
      return articlesAPI.updateArticle(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      refetch();
      setIsEditDialogOpen(false);
      setShowEditor(false);
      resetForm();
      toast.success('Article updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update article error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update article';
      toast.error(errorMessage);
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('🗑️ Deleting article:', id);
      return articlesAPI.deleteArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      refetch();
      toast.success('Article deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete article error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete article';
      toast.error(errorMessage);
    },
  });

  // AI article generation mutation
  const generateAIMutation = useMutation({
    mutationFn: (urls) => {
      console.log('🤖 Generating AI articles for URLs:', urls);
      return articlesAPI.generateAIArticles({ baseUrls: urls });
    },
    onSuccess: (response) => {
      console.log('✅ AI articles generated successfully:', response);
      queryClient.invalidateQueries(['articles']);
      refetch();
      setIsAIDialogOpen(false);
      setAiUrls('');
      toast.success(`Successfully generated ${response.data.articles.length} AI articles`);
    },
    onError: (error) => {
      console.error('❌ AI article generation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate AI articles';
      toast.error(errorMessage);
    },
  });

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: '',
      image: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      isPublished: false
    });
    setSelectedArticle(null);
    setPreviewMode(false);
  }, []);

  // Fixed input change handler to prevent focus issues
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target ? e.target.value : e;
    
    setFormData(prev => {
      return { ...prev, [field]: value };
    });
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  // Enhanced form submission with comprehensive validation and debugging
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted with data:', formData);
    
    try {
      // Client-side validation with detailed logging
      console.log('🔍 Starting client-side validation...');
      
      if (!formData.title?.trim()) {
        console.error('❌ Validation failed: Article title is required');
        toast.error('Article title is required');
        return;
      }
      
      if (!formData.content?.trim()) {
        console.error('❌ Validation failed: Article content is required');
        toast.error('Article content is required');
        return;
      }
      
      if (formData.content.trim().length < 50) {
        console.error('❌ Validation failed: Content too short');
        toast.error('Article content must be at least 50 characters long');
        return;
      }
      
      console.log('✅ Client-side validation passed');

      // Prepare article data with proper validation and type conversion
      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim()
      };

      console.log('🔧 Base article data prepared:', articleData);

      // Only add optional fields if they have values
      if (formData.category && formData.category.trim()) {
        articleData.category = formData.category.trim();
        console.log('➕ Added category:', articleData.category);
      }
      
      if (formData.image && formData.image.trim()) {
        articleData.image = formData.image.trim();
        console.log('➕ Added image:', articleData.image);
      }
      
      if (formData.metaTitle && formData.metaTitle.trim()) {
        articleData.metaTitle = formData.metaTitle.trim();
        console.log('➕ Added metaTitle:', articleData.metaTitle);
      }
      
      if (formData.metaDescription && formData.metaDescription.trim()) {
        articleData.metaDescription = formData.metaDescription.trim();
        console.log('➕ Added metaDescription:', articleData.metaDescription);
      }
      
      // Handle tags and keywords
      if (formData.tags && formData.tags.trim()) {
        articleData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        console.log('➕ Added tags:', articleData.tags);
      }
      
      if (formData.keywords && formData.keywords.trim()) {
        articleData.keywords = formData.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
        console.log('➕ Added keywords:', articleData.keywords);
      }
      
      // Handle boolean fields
      articleData.isPublished = Boolean(formData.isPublished);
      
      console.log('🎯 Final article data to be sent:', JSON.stringify(articleData, null, 2));
      
      if (selectedArticle) {
        console.log('🔄 Updating existing article...');
        updateMutation.mutate({ id: selectedArticle._id, data: articleData });
      } else {
        console.log('🆕 Creating new article...');
        createMutation.mutate(articleData);
      }
    } catch (error) {
      console.error('💥 Error preparing article data:', error);
      toast.error('Error preparing article data: ' + error.message);
    }
  }, [formData, createMutation, updateMutation, selectedArticle]);

  const handleEdit = useCallback((article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title || '',
      content: article.content || '',
      category: article.category || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      image: article.image || '',
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      keywords: Array.isArray(article.keywords) ? article.keywords.join(', ') : '',
      isPublished: Boolean(article.isPublished)
    });
    setShowEditor(true);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleCreateArticle = useCallback(() => {
    resetForm();
    setShowEditor(true);
    setIsCreateDialogOpen(true);
  }, [resetForm]);

  const handleCreateAIArticle = useCallback(() => {
    setAiUrls('');
    setIsAIDialogOpen(true);
  }, []);

  const handleGenerateAIArticles = useCallback(() => {
    if (!aiUrls.trim()) {
      toast.error('Please enter at least one URL');
      return;
    }

    const urls = aiUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast.error('Please enter valid URLs');
      return;
    }

    // Validate URLs
    const invalidUrls = urls.filter(url => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      toast.error(`Invalid URLs: ${invalidUrls.join(', ')}`);
      return;
    }

    generateAIMutation.mutate(urls);
  }, [aiUrls, generateAIMutation]);

  const handleBackToList = useCallback(() => {
    setShowEditor(false);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    resetForm();
  }, [resetForm]);

  // Memoized filtered articles to prevent unnecessary re-renders
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchTerm || 
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'published' && article.isPublished) ||
        (statusFilter === 'draft' && !article.isPublished);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchTerm, categoryFilter, statusFilter]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(articles.map(a => a.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [articles]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading articles</h3>
          <p className="text-red-600 text-sm mt-1">
            {error?.response?.data?.message || error?.message || 'Failed to load articles'}
          </p>
          <button 
            onClick={handleRefresh}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show editor view when creating or editing
  if (showEditor && (isCreateDialogOpen || isEditDialogOpen)) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedArticle ? 'Edit Article' : 'Create New Article'}
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedArticle ? 'Update your existing article' : 'Write and publish a new article to your website'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              {previewMode ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save & Publish'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Editor Type</p>
                  <p className="text-lg font-bold">{editorType === 'tinymce' ? 'TinyMCE' : editorType === 'quill' ? 'Quill' : 'HTML'}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Content Length</p>
                  <p className="text-lg font-bold">{formData.content.length} chars</p>
                </div>
                <Badge variant="outline">{formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} words</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-bold">{formData.isPublished ? 'Published' : 'Draft'}</p>
                </div>
                <Badge variant={formData.isPublished ? 'default' : 'secondary'}>
                  {formData.isPublished ? 'Live' : 'Draft'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <p className="text-lg font-bold">{formData.category || 'None'}</p>
                </div>
                <Badge variant="outline">{formData.category || 'Uncategorized'}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Article Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <h1>{formData.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <Badge variant="outline">{formData.category || 'Uncategorized'}</Badge>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <Badge variant={formData.isPublished ? 'default' : 'secondary'}>
                    {formData.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Article Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Article Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Article Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange('title')}
                      placeholder="Enter article title..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange('category')}
                      placeholder="Enter category..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={handleInputChange('tags')}
                      placeholder="tag1, tag2, tag3..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Featured Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={handleInputChange('image')}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.isPublished}
                    onCheckedChange={handleInputChange('isPublished')}
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange('metaTitle')}
                    placeholder="SEO title for search engines..."
                  />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Input
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange('metaDescription')}
                    placeholder="Brief description for search results..."
                  />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange('keywords')}
                    placeholder="keyword1, keyword2, keyword3..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Editor Selection and Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Editor
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="editor-type" className="text-sm">Editor Type:</Label>
                    <Select value={editorType} onValueChange={setEditorType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tinymce">TinyMCE</SelectItem>
                        <SelectItem value="quill">Quill</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editorType === 'tinymce' ? (
                  <TinyMCEEditor
                    value={formData.content}
                    onChange={handleInputChange('content')}
                    placeholder="Start writing your article content..."
                    height={500}
                    showWordCount={true}
                    showToolbar={true}
                  />
                ) : editorType === 'quill' ? (
                  <QuillEditor
                    value={formData.content}
                    onChange={handleInputChange('content')}
                    placeholder="Start writing your article content..."
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="html-content" className="text-sm font-medium">
                        HTML Content
                      </Label>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Direct HTML editing</span>
                        <Code className="h-3 w-3" />
                      </div>
                    </div>
                    <textarea
                      id="html-content"
                      value={formData.content}
                      onChange={handleInputChange('content')}
                      placeholder="Enter your HTML content here..."
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Characters: {formData.content.length} | 
                        Words: {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length}
                      </span>
                      <span>HTML tags will be preserved</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles Management</h1>
          <p className="text-gray-600">Manage your blog posts and articles</p>
          <div className="text-xs text-gray-500 mt-1">
            Bypass mode: {localStorage.getItem('bypassLogin') === 'true' ? '✅ Enabled' : '❌ Disabled'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleCreateAIArticle}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={generateAIMutation.isLoading}
          >
            {generateAIMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Create Article with AI
          </button>
          <button
            onClick={handleCreateArticle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Article
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.filter(a => a.isPublished).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.filter(a => !a.isPublished).length}
              </p>
            </div>
            <EyeOff className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <Filter className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="-title">Title Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first article'
              }
            </p>
            <button
              onClick={handleCreateArticle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {article.image && (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {article.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {truncateContent(article.content)}
                          </p>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{article.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {article.category}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {article.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(article.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Article Generation Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Create Articles with AI
            </DialogTitle>
            <DialogDescription>
              Enter base URLs to generate SEO-optimized articles automatically. Each URL will create a separate article with unique content, proper HTML structure, and optimized meta tags.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-urls" className="text-sm font-medium">
                Base URLs (one per line)
              </Label>
              <Textarea
                id="ai-urls"
                value={aiUrls}
                onChange={(e) => setAiUrls(e.target.value)}
                placeholder="https://example.com&#10;https://another-site.com&#10;https://business-website.com"
                className="min-h-32 mt-2"
                disabled={generateAIMutation.isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter valid URLs starting with http:// or https://. Each URL will generate a unique article.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Generated Articles Will Include:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• SEO-optimized HTML structure with proper meta tags</li>
                <li>• Unique selling points and competitive advantages</li>
                <li>• Location-specific content and local SEO elements</li>
                <li>• Customer experience highlights and testimonials</li>
                <li>• Mobile-responsive design with clean styling</li>
                <li>• Professional typography and layout</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAIDialogOpen(false)}
              disabled={generateAIMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAIArticles}
              disabled={generateAIMutation.isLoading || !aiUrls.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateAIMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating Articles...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Articles
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticlesPage;



