import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  Filter,
  Download,
  Upload,
  Star,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { productsAPI, productGeneratorAPI } from '../lib/api';
import { Checkbox } from '../components/ui/checkbox';
import { Button } from '../components/ui/button';

const EnhancedSimpleProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiProductUrl, setAiProductUrl] = useState('');
  const [aiTaskId, setAiTaskId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    subcategory: '',
    brand: '',
    image: '',
    images: [],
    countInStock: '10',
    lowStockThreshold: '10',
    sku: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    specifications: {},
    tags: '',
    seoTitle: '',
    seoDescription: '',
    isFeatured: false,
    isActive: true
  });
  const [csvFile, setCsvFile] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

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

  const aiTaskStatusQuery = useQuery({
    queryKey: ['aiProductTaskStatus', aiTaskId],
    queryFn: () => productGeneratorAPI.getProductGenerationStatus(aiTaskId),
    enabled: !!aiTaskId,
    refetchInterval: (query) => {
      // In v5, the argument is the query object. Data is in query.state.data
      const data = query.state.data;
      if (!data || !data.data) {
        return false;
      }
      const status = data.data.status;
      return status === 'pending' || status === 'in_progress' ? 2000 : false;
    },
    onSuccess: (data) => {
      const task = data?.data;
      if (!task) return; // Guard against undefined task object

      if (task.status === 'completed') {
        toast.success('Product data generated successfully!');
        setAiTaskId(null);
        const productData = task.product_data;
        setFormData({
          ...formData,
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price?.toString() || '',
          comparePrice: productData.comparePrice?.toString() || '',
          category: productData.category || '',
          subcategory: productData.subcategory || '',
          brand: productData.brand || '',
          image: productData.image || '',
          images: productData.images || [],
          countInStock: productData.countInStock?.toString() || '10',
          sku: productData.sku || '',
          tags: Array.isArray(productData.tags) ? productData.tags.join(', ') : '',
          seoTitle: productData.seoTitle || '',
          seoDescription: productData.seoDescription || '',
        });
        setIsAiDialogOpen(false);
        setIsCreateDialogOpen(true);
      } else if (task.status === 'failed') {
        let errorMessage = `AI generation failed: ${task.error}`;
        if (task.error?.includes('eBay is blocking the request')) {
          errorMessage = "Could not get product data. eBay is blocking automated requests.";
        } else if (task.error?.includes('only supports eBay.com')) {
          errorMessage = "This scraper currently only supports eBay.com URLs.";
        }
        toast.error(errorMessage);
        setAiTaskId(null);
      }
    },
    onError: (error) => {
      toast.error('Failed to get AI task status.');
      setAiTaskId(null);
    }
  });

  const generateProductMutation = useMutation({
    mutationFn: productGeneratorAPI.generateProduct,
    onSuccess: (response) => {
      const taskId = response.data.task_id;
      setAiTaskId(taskId);
      toast.info('Started AI product generation...');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Failed to start AI generation.';
      toast.error(errorMessage);
    }
  });

  const handleGenerateProduct = () => {
    if (!aiProductUrl) {
      toast.error('Please enter a product URL.');
      return;
    }
    generateProductMutation.mutate(aiProductUrl);
  };


  // Fetch products with enhanced error handling
  const { data: productsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['products', { search: searchTerm, category: categoryFilter, status: statusFilter, sort: sortBy }],
    queryFn: () => {
      console.log('🔍 Fetching products with params:', {
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
        sort: sortBy,
        limit: 50
      });
      
      return productsAPI.getProducts({
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
        sort: sortBy,
        limit: 50
      }).then(res => {
        console.log('📦 Products response:', res.data);
        return res.data;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  const products = productsResponse?.data || [];
  const totalProducts = productsResponse?.pagination?.total || 0;

  // Create product mutation with enhanced error handling and debugging
  const createMutation = useMutation({
    mutationFn: (productData) => {
      console.log('🚀 Creating product with data:', productData);
      
      // Validate data before sending
      const requiredFields = ['name', 'description', 'price', 'category', 'brand', 'image', 'countInStock'];
      const missingFields = requiredFields.filter(field => {
        const value = productData[field];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate data types
      if (isNaN(productData.price) || parseFloat(productData.price) <= 0) {
        console.error('❌ Invalid price:', productData.price);
        throw new Error('Price must be a positive number');
      }
      
      if (isNaN(productData.countInStock) || parseInt(productData.countInStock) < 0) {
        console.error('❌ Invalid stock count:', productData.countInStock);
        throw new Error('Stock count must be a non-negative integer');
      }
      
      console.log('✅ Data validation passed, sending to API...');
      return productsAPI.createProduct(productData);
    },
    onSuccess: (response) => {
      console.log('✅ Product created successfully:', response);
      // Force refetch products
      queryClient.invalidateQueries(['products']);
      refetch();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Product created successfully');
    },
    onError: (error) => {
      console.error('❌ Create product error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create product';
      
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

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🔄 Updating product:', id, 'with data:', data);
      return productsAPI.updateProduct(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      refetch();
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update product error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update product';
      toast.error(errorMessage);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('🗑️ Deleting product:', id);
      return productsAPI.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      refetch();
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete product error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete product';
      toast.error(errorMessage);
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return productsAPI.bulkImportProducts(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      refetch();
      setCsvFile(null);
      toast.success('Products imported successfully');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to import products';
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
      setSelectedProducts(filteredProducts.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, id]);
    } else {
      setSelectedProducts((prev) => prev.filter((productId) => productId !== id));
    }
  };

  const handleExport = () => {
    productsAPI.exportProducts({ ids: selectedProducts })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'products.csv');
        document.body.appendChild(link);
        link.click();
        toast.success('Products exported successfully');
      })
      .catch(error => {
        toast.error('Failed to export products');
      });
  };

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      subcategory: '',
      brand: '',
      image: '',
      images: [],
      countInStock: '10',
      lowStockThreshold: '10',
      sku: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      specifications: {},
      tags: '',
      seoTitle: '',
      seoDescription: '',
      isFeatured: false,
      isActive: true
    });
    setSelectedProduct(null);
  }, []);

  // Fixed input change handler to prevent focus issues
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target ? e.target.value : e;
    
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      } else {
        return { ...prev, [field]: value };
      }
    });
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Enhanced form submission with comprehensive validation and debugging
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted with data:', formData);
    
    try {
      // Client-side validation with detailed logging
      console.log('🔍 Starting client-side validation...');
      
      if (!formData.name?.trim()) {
        console.error('❌ Validation failed: Product name is required');
        toast.error('Product name is required');
        return;
      }
      
      if (!formData.description?.trim()) {
        console.error('❌ Validation failed: Product description is required');
        toast.error('Product description is required');
        return;
      }
      
      if (formData.description.trim().length < 10) {
        console.error('❌ Validation failed: Description too short');
        toast.error('Description must be at least 10 characters long');
        return;
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        console.error('❌ Validation failed: Invalid price');
        toast.error('Valid product price is required');
        return;
      }
      
      if (!formData.category?.trim()) {
        console.error('❌ Validation failed: Category is required');
        toast.error('Product category is required');
        return;
      }
      
      if (!formData.brand?.trim()) {
        console.error('❌ Validation failed: Brand is required');
        toast.error('Product brand is required');
        return;
      }
      
      if (!formData.image?.trim()) {
        console.error('❌ Validation failed: Image is required');
        toast.error('Product image URL is required');
        return;
      }
      
      console.log('✅ Client-side validation passed');

      // Prepare product data with proper validation and type conversion
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        image: formData.image.trim(),
        countInStock: parseInt(formData.countInStock) || 0
      };

      console.log('🔧 Base product data prepared:', productData);

      // Only add optional fields if they have values
      if (formData.comparePrice && formData.comparePrice.trim()) {
        productData.comparePrice = parseFloat(formData.comparePrice);
        console.log('➕ Added comparePrice:', productData.comparePrice);
      }
      
      if (formData.subcategory && formData.subcategory.trim()) {
        productData.subcategory = formData.subcategory.trim();
        console.log('➕ Added subcategory:', productData.subcategory);
      }
      
      if (formData.sku && formData.sku.trim()) {
        productData.sku = formData.sku.trim();
        console.log('➕ Added sku:', productData.sku);
      }
      
      if (formData.weight && formData.weight.trim()) {
        productData.weight = parseFloat(formData.weight);
        console.log('➕ Added weight:', productData.weight);
      }
      
      if (formData.lowStockThreshold && formData.lowStockThreshold.trim()) {
        productData.lowStockThreshold = parseInt(formData.lowStockThreshold);
        console.log('➕ Added lowStockThreshold:', productData.lowStockThreshold);
      }
      
      // Handle dimensions only if at least one dimension is provided
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        productData.dimensions = {};
        if (formData.dimensions.length) productData.dimensions.length = parseFloat(formData.dimensions.length);
        if (formData.dimensions.width) productData.dimensions.width = parseFloat(formData.dimensions.width);
        if (formData.dimensions.height) productData.dimensions.height = parseFloat(formData.dimensions.height);
        console.log('➕ Added dimensions:', productData.dimensions);
      }
      
      // Handle tags
      if (formData.tags && formData.tags.trim()) {
        productData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        console.log('➕ Added tags:', productData.tags);
      }
      
      // Handle SEO fields
      if (formData.seoTitle && formData.seoTitle.trim()) {
        productData.seoTitle = formData.seoTitle.trim();
        console.log('➕ Added seoTitle:', productData.seoTitle);
      }
      
      if (formData.seoDescription && formData.seoDescription.trim()) {
        productData.seoDescription = formData.seoDescription.trim();
        console.log('➕ Added seoDescription:', productData.seoDescription);
      }
      
      // Handle boolean fields
      productData.isFeatured = Boolean(formData.isFeatured);
      productData.isActive = Boolean(formData.isActive);
      
      console.log('🎯 Final product data to be sent:', JSON.stringify(productData, null, 2));
      
      if (selectedProduct) {
        console.log('🔄 Updating existing product...');
        updateMutation.mutate({ id: selectedProduct._id, data: productData });
      } else {
        console.log('🆕 Creating new product...');
        createMutation.mutate(productData);
      }
    } catch (error) {
      console.error('💥 Error preparing product data:', error);
      toast.error('Error preparing product data: ' + error.message);
    }
  }, [formData, createMutation, updateMutation, selectedProduct]);

  const handleEdit = useCallback((product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      comparePrice: product.comparePrice?.toString() || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      image: product.image || '',
      images: Array.isArray(product.images) ? product.images : [],
      countInStock: product.countInStock?.toString() || '10',
      lowStockThreshold: product.lowStockThreshold?.toString() || '10',
      sku: product.sku || '',
      weight: product.weight?.toString() || '',
      dimensions: {
        length: product.dimensions?.length?.toString() || '',
        width: product.dimensions?.width?.toString() || '',
        height: product.dimensions?.height?.toString() || ''
      },
      specifications: product.specifications || {},
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      isFeatured: Boolean(product.isFeatured),
      isActive: Boolean(product.isActive)
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  // Memoized filtered products to prevent unnecessary re-renders
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading products</h3>
          <p className="text-red-600 text-sm mt-1">
            {error?.response?.data?.message || error?.message || 'Failed to load products'}
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
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
            Create Product
          </button>
          <button
            onClick={() => setIsAiDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Add with AI
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.countInStock <= (p.lowStockThreshold || 10)).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="-name">Name Z-A</option>
                <option value="price">Price Low-High</option>
                <option value="-price">Price High-Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Import</h3>
          <div className="flex items-center space-x-4">
            <input type="file" accept=".csv" className="w-full" onChange={handleFileChange} />
            <button
              onClick={handleBulkImport}
              disabled={!csvFile || bulkImportMutation.isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {bulkImportMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import
                </>
              )}
            </button>
            <a href="/samples/products.csv" download className="text-blue-600 hover:underline">
              Download Sample
            </a>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first product.</p>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onCheckedChange={(checked) => handleSelectOne(checked, product._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.image ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price)}
                      {product.comparePrice && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.countInStock}</div>
                      {product.countInStock <= (product.lowStockThreshold || 10) && (
                        <div className="text-xs text-orange-600">Low Stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
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

      {/* Create/Edit Product Dialog */}
      {(isCreateDialogOpen || isEditDialogOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {selectedProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Enter product name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={handleInputChange('sku')}
                    placeholder="Product SKU"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Enter product description (minimum 10 characters)"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/10 characters minimum
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    placeholder="e.g., Activities"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={handleInputChange('subcategory')}
                    placeholder="e.g., Outdoor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={handleInputChange('brand')}
                    placeholder="Brand name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price * (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleInputChange('price')}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compare Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.comparePrice}
                    onChange={handleInputChange('comparePrice')}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={handleInputChange('image')}
                  placeholder="https://example.com/image.jpg"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Count *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.countInStock}
                    onChange={handleInputChange('countInStock')}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={handleInputChange('lowStockThreshold')}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured')(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive')(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
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
                    : selectedProduct ? 'Update Product' : 'Create Product'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Product Generation Dialog */}
      {isAiDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Add Product with AI
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product URL
                </label>
                <input
                  type="url"
                  value={aiProductUrl}
                  onChange={(e) => setAiProductUrl(e.target.value)}
                  placeholder="https://example.com/product-page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {(generateProductMutation.isPending || aiTaskStatusQuery.isFetching) && (
                <div className="flex items-center gap-2 text-purple-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span>Generating product data... This may take a moment.</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsAiDialogOpen(false)}
                disabled={generateProductMutation.isPending || aiTaskStatusQuery.isFetching}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateProduct}
                disabled={generateProductMutation.isPending || aiTaskStatusQuery.isFetching}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {generateProductMutation.isPending || aiTaskStatusQuery.isFetching ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSimpleProductsPage;

