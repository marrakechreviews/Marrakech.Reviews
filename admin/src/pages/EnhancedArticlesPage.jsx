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
  Save,
  X,
  ExternalLink,
  Copy,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { articlesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Progress } from '../components/ui/progress';
import HtmlEditor from '../components/HtmlEditor';
import TinyMCEEditor from '../components/TinyMCEEditor';
import SeoTools from '../components/SeoTools';

const EnhancedArticlesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    image: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    slug: '',
    editorType: 'tinymce',
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

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && (!formData.slug || formData.slug === generateSlug(selectedArticle?.title || ''))) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, selectedArticle]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

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
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });

  const articles = articlesResponse?.articles || [];
  const totalArticles = articles.length;

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: (articleData) => {
      console.log('🚀 Creating article with data:', articleData);
      
      const requiredFields = ['title', 'content'];
      const missingFields = requiredFields.filter(field => {
        const value = articleData[field];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      if (articleData.content.trim().length < 50) {
        console.error('❌ Content too short:', articleData.content.length);
        throw new Error('Article content must be at least 50 characters long');
      }
      
      console.log('✅ Data validation passed, sending to API...');
      return articlesAPI.createArticle(articleData);
    },
    onSuccess: (response) => {
      console.log('✅ Article created successfully:', response);
      queryClient.invalidateQueries(['articles']);
      refetch();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Article created successfully');
    },
    onError: (error) => {
      console.error('❌ Create article error:', error);
      
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

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: [],
      image: '',
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      slug: '',
      editorType: 'tinymce',
      isPublished: false
    });
    setSelectedArticle(null);
    setActiveTab('content');
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  // Enhanced form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted with data:', formData);
    
    try {
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

      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        isPublished: Boolean(formData.isPublished)
      };

      console.log('🔧 Base article data prepared:', articleData);

      // Add optional fields if they have values
      if (formData.category && formData.category.trim()) {
        articleData.category = formData.category.trim();
      }
      
      if (formData.image && formData.image.trim()) {
        articleData.image = formData.image.trim();
      }
      
      if (formData.metaTitle && formData.metaTitle.trim()) {
        articleData.metaTitle = formData.metaTitle.trim();
      }
      
      if (formData.metaDescription && formData.metaDescription.trim()) {
        articleData.metaDescription = formData.metaDescription.trim();
      }
      
      if (formData.slug && formData.slug.trim()) {
        articleData.slug = formData.slug.trim();
      }
      
      if (formData.tags && formData.tags.length > 0) {
        articleData.tags = formData.tags.filter(tag => tag.trim());
      }
      
      if (formData.keywords && formData.keywords.length > 0) {
        articleData.keywords = formData.keywords.filter(keyword => keyword.trim());
      }
      
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
      tags: Array.isArray(article.tags) ? article.tags : [],
      image: article.image || '',
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      keywords: Array.isArray(article.keywords) ? article.keywords : [],
      slug: article.slug || '',
      editorType: article.editorType || 'tinymce',
      isPublished: Boolean(article.isPublished)
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleDuplicate = useCallback((article) => {
    setSelectedArticle(null);
    setFormData({
      title: `${article.title} (Copy)`,
      content: article.content || '',
      category: article.category || '',
      tags: Array.isArray(article.tags) ? [...article.tags] : [],
      image: article.image || '',
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      keywords: Array.isArray(article.keywords) ? [...article.keywords] : [],
      slug: '',
      isPublished: false
    });
    setIsCreateDialogOpen(true);
  }, []);

  const handlePreview = useCallback((article) => {
    const previewUrl = `${window.location.origin}/articles/${article.slug || article._id}`;
    window.open(previewUrl, '_blank');
  }, []);

  // Memoized filtered articles
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

  const ArticleDialog = ({ isOpen, onClose, title }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Article Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title')(e.target.value)}
                    placeholder="Enter article title..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category')(e.target.value)}
                    placeholder="Enter category..."
                  />
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Article Content *</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="editor-type" className="text-sm">Editor Type:</Label>
                    <Select value={formData.editorType || 'tinymce'} onValueChange={(value) => handleInputChange('editorType')(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tinymce">TinyMCE</SelectItem>
                        <SelectItem value="html">HTML Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(formData.editorType || 'tinymce') === 'tinymce' ? (
                  <TinyMCEEditor
                    value={formData.content}
                    onChange={handleInputChange('content')}
                    placeholder="Start writing your article content..."
                    height={400}
                  />
                ) : (
                  <HtmlEditor
                    value={formData.content}
                    onChange={handleInputChange('content')}
                    placeholder="Start writing your article content..."
                  />
                )}
              </div>

              {/* Featured Image */}
              <div>
                <Label htmlFor="image">Featured Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image')(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="max-w-xs h-auto rounded border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <SeoTools
                title={formData.title}
                metaTitle={formData.metaTitle}
                metaDescription={formData.metaDescription}
                keywords={formData.keywords}
                content={formData.content}
                slug={formData.slug}
                onTitleChange={handleInputChange('title')}
                onMetaTitleChange={handleInputChange('metaTitle')}
                onMetaDescriptionChange={handleInputChange('metaDescription')}
                onKeywordsChange={handleInputChange('keywords')}
                onSlugChange={handleInputChange('slug')}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Add tags separated by commas..."
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      handleInputChange('tags')(tags);
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = formData.tags.filter((_, i) => i !== index);
                            handleInputChange('tags')(newTags);
                          }}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Publication Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={handleInputChange('isPublished')}
                />
                <Label htmlFor="published">
                  {formData.isPublished ? 'Published' : 'Draft'}
                </Label>
              </div>

              {/* Article Stats */}
              {selectedArticle && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Article Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                        <p className="text-sm">{formatDate(selectedArticle.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                        <p className="text-sm">{formatDate(selectedArticle.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant={selectedArticle.isPublished ? "default" : "secondary"}>
                          {selectedArticle.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                        <p className="text-sm">
                          {selectedArticle.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Dialog Actions */}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              {selectedArticle && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePreview(selectedArticle)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Article'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Articles</h1>
          <p className="text-gray-600">Manage your blog posts with advanced editing and SEO tools</p>
          <div className="text-xs text-gray-500 mt-1">
            Bypass mode: {localStorage.getItem('bypassLogin') === 'true' ? '✅ Enabled' : '❌ Disabled'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
          >
            🔄 Refresh
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.isPublished).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => !a.isPublished).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest First</SelectItem>
                <SelectItem value="createdAt">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="-title">Title Z-A</SelectItem>
                <SelectItem value="-updatedAt">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first article.'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredArticles.map((article) => (
                <div key={article._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <Badge variant={article.isPublished ? "default" : "secondary"}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        {article.category && (
                          <Badge variant="outline">{article.category}</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {truncateContent(article.content)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                        {article.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{article.author.name || 'Anonymous'}</span>
                          </div>
                        )}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span>{article.tags.length} tags</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(article)}
                        title="Preview"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(article)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(article)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article._id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <ArticleDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          resetForm();
        }}
        title="Create New Article"
      />

      {/* Edit Dialog */}
      <ArticleDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          resetForm();
        }}
        title="Edit Article"
      />
    </div>
  );
};

export default EnhancedArticlesPage;

