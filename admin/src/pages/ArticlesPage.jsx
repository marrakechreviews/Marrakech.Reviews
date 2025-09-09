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
import { Checkbox } from '../components/ui/checkbox';
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
  const [csvFile, setCsvFile] = useState(null);
  const [selectedArticles, setSelectedArticles] = useState([]);

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

  const bulkImportMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return articlesAPI.bulkImportArticles(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      refetch();
      setCsvFile(null);
      toast.success('Articles imported successfully');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to import articles';
      toast.error(errorMessage);
    },
  });

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleBulkImport = () => {
    if (csvFile) {
      bulkImportMutation.mutate(csvFile);
    } else {
      toast.error('Please select a CSV file to import');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArticles(filteredArticles.map((a) => a._id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedArticles((prev) => [...prev, id]);
    } else {
      setSelectedArticles((prev) => prev.filter((articleId) => articleId !== id));
    }
  };

  const handleExport = () => {
    articlesAPI.exportArticles({ ids: selectedArticles })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'articles.csv');
        document.body.appendChild(link);
        link.click();
        toast.success('Articles exported successfully');
      })
      .catch(error => {
        toast.error('Failed to export articles');
      });
  };

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

  const handleGenerateAIArticles = useCallback(async () => {
    if (!aiUrls.trim()) {
      toast.error("Please enter at least one URL");
      return;
    }

    const urls = aiUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      toast.error("Please enter valid URLs");
      return;
    }

    // Validate URLs
    const invalidUrls = urls.filter((url) => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      toast.error(`Invalid URLs: ${invalidUrls.join(", ")}`);
      return;
    }

    try {
      // Call the backend to generate article data (but not save it yet)
      const response = await articlesAPI.generateAIArticles({ baseUrls: urls });
      const generatedArticleData = response.data.articles[0]; // Assuming one article for simplicity

      if (generatedArticleData) {
        setFormData({
          title: generatedArticleData.title || "",
          content: generatedArticleData.content || "",
          category: generatedArticleData.category || "",
          tags: Array.isArray(generatedArticleData.tags) ? generatedArticleData.tags.join(", ") : "",
          image: generatedArticleData.image || "", // This will be the thumbnail link
          metaTitle: generatedArticleData.metaTitle || "",
          metaDescription: generatedArticleData.metaDescription || "",
          keywords: Array.isArray(generatedArticleData.keywords) ? generatedArticleData.keywords.join(", ") : "",
          isPublished: false, // Always start as draft for review
        });
        setIsAIDialogOpen(false); // Close AI generation dialog
        setShowEditor(true); // Open the editor
        setIsCreateDialogOpen(true); // Open the create dialog
        toast.success("AI article generated and loaded into editor for review.");
      } else {
        toast.error("No article data generated by AI.");
      }
    } catch (error) {
      console.error("❌ AI article generation error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to generate AI articles";
      toast.error(errorMessage);
    }
  }, [aiUrls, articlesAPI, setFormData, setIsAIDialogOpen, setShowEditor, setIsCreateDialogOpen]);

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
    const uniqueCategories = [...new Set(articles.map(article => article.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [articles]);

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Articles</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedArticle ? 'Edit Article' : 'Create Article'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={editorType} onValueChange={setEditorType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tinymce">TinyMCE</SelectItem>
                  <SelectItem value="quill">Quill</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2"
              >
                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <Card>
                  <CardHeader>
                    <CardTitle>Article Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={formData.title}
                      onChange={handleInputChange('title')}
                      placeholder="Enter article title..."
                      className="text-lg"
                    />
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {previewMode ? (
                      <div 
                        className="prose max-w-none min-h-[400px] p-4 border rounded-md bg-white"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    ) : (
                      <div className="min-h-[400px]">
                        {editorType === 'tinymce' ? (
                          <TinyMCEEditor
                            value={formData.content}
                            onChange={handleInputChange('content')}
                            height={400}
                          />
                        ) : (
                          <QuillEditor
                            value={formData.content}
                            onChange={handleInputChange('content')}
                            height={400}
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Publish Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      <Label htmlFor="image">Thumbnail Image URL</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={handleInputChange('image')}
                        placeholder="e.g., https://example.com/image.jpg"
                      />
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
                      <Textarea
                        id="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange('metaDescription')}
                        placeholder="Brief description for search engines..."
                        rows={3}
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

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col space-y-3">
                      <Button
                        type="submit"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                        className="w-full"
                      >
                        {createMutation.isLoading || updateMutation.isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {selectedArticle ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {selectedArticle ? 'Update Article' : 'Create Article'}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToList}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">Manage your blog articles and content</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleCreateAIArticle}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate AI Articles</span>
          </Button>
          <Button
            onClick={handleCreateArticle}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Article</span>
          </Button>
        </div>
      </div>

      {/* Filters and Bulk Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input type="file" accept=".csv" onChange={handleFileChange} />
              <Button onClick={handleBulkImport} disabled={!csvFile || bulkImportMutation.isLoading}>
                {bulkImportMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <a href="/samples/articles.csv" download>
                  <Download className="mr-2 h-4 w-4" />
                  Sample
                </a>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <CardTitle>
                Articles ({filteredArticles.length})
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading articles: {error.message}</p>
              <Button onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new article.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateArticle}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Article
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedArticles.includes(article._id)}
                    onCheckedChange={(checked) => handleSelectOne(checked, article._id)}
                    className="mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {article.title}
                      </h3>
                      <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {article.category && (
                        <Badge variant="outline">
                          {article.category}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {truncateContent(article.content)}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                      {article.author && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{article.author.name || 'Unknown'}</span>
                        </div>
                      )}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="h-3 w-3" />
                          <span>{article.tags.slice(0, 2).join(', ')}</span>
                          {article.tags.length > 2 && <span>+{article.tags.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(article._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Article Generation Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate AI Articles</DialogTitle>
            <DialogDescription>
              Enter URLs to generate articles from. Each URL will be processed to create a unique article.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="urls">URLs (one per line)</Label>
              <Textarea
                id="urls"
                value={aiUrls}
                onChange={(e) => setAiUrls(e.target.value)}
                placeholder="https://example.com/page1&#10;https://example.com/page2"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAIDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAIArticles}
              disabled={generateAIMutation.isLoading}
            >
              {generateAIMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Articles
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

