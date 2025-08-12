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
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { articlesAPI } from '../lib/api';

const EnhancedArticlesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
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
      resetForm();
      toast.success('Article created successfully');
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
      tags: '',
      image: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      isPublished: false
    });
    setSelectedArticle(null);
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
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
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
            onClick={() => setIsCreateDialogOpen(true)}
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
        <div className="flex flex-col lg:flex-row gap-4">
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
          
          <div className="flex gap-4">
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

      {/* Articles Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first article.</p>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {article.image ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={article.image}
                              alt={article.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {truncateContent(article.content, 50)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.category}
                        </span>
                      ) : (
                        <span className="text-gray-400">No category</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.isPublished ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create/Edit Article Dialog */}
      {(isCreateDialogOpen || isEditDialogOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {selectedArticle ? 'Edit Article' : 'Create New Article'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  placeholder="Enter article title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={handleInputChange('content')}
                  placeholder="Write your article content here... (minimum 50 characters)"
                  rows={8}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/50 characters minimum
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    placeholder="e.g., Technology, Business"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={handleInputChange('image')}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={handleInputChange('tags')}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={handleInputChange('metaTitle')}
                    placeholder="SEO optimized title (max 60 characters)"
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={handleInputChange('keywords')}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={handleInputChange('metaDescription')}
                  placeholder="Brief description for search engines (max 160 characters)"
                  maxLength={160}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished')(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish Article</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : selectedArticle ? 'Update Article' : 'Create Article'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedArticlesPage;

