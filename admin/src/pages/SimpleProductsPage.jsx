import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  Filter,
  Download,
  Upload,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { productsAPI } from '../lib/api';

const EnhancedSimpleProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    isFeatured: false,
    isActive: true,
    seoTitle: '',
    seoDescription: ''
  });

  const queryClient = useQueryClient();

  // Fetch products with error handling
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm, categoryFilter, statusFilter, sortBy],
    queryFn: () => productsAPI.getProducts({ 
      keyword: searchTerm || undefined,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      sort: sortBy,
      limit: 50
    }),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products = productsResponse?.data?.data || [];
  const totalProducts = productsResponse?.data?.pagination?.total || 0;

  // Create product mutation with enhanced error handling
  const createMutation = useMutation({
    mutationFn: (productData) => {
      console.log('Creating product with data:', productData);
      return productsAPI.createProduct(productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Product created successfully');
    },
    onError: (error) => {
      console.error('Create product error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create product';
      toast.error(errorMessage);
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('Updating product:', id, 'with data:', data);
      return productsAPI.updateProduct(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      console.error('Update product error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update product';
      toast.error(errorMessage);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('Deleting product:', id);
      return productsAPI.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      console.error('Delete product error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete product';
      toast.error(errorMessage);
    },
  });

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
      isFeatured: false,
      isActive: true,
      seoTitle: '',
      seoDescription: ''
    });
    setSelectedProduct(null);
  }, []);

  const handleCreate = useCallback(() => {
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Use the same simple structure as the working SimpleProductsPage
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        image: formData.image || '',
        countInStock: parseInt(formData.countInStock) || 10
      };

      // Only add optional fields if they have values
      if (formData.comparePrice && formData.comparePrice.trim()) {
        productData.comparePrice = parseFloat(formData.comparePrice);
      }
      
      if (formData.subcategory && formData.subcategory.trim()) {
        productData.subcategory = formData.subcategory.trim();
      }
      
      if (formData.sku && formData.sku.trim()) {
        productData.sku = formData.sku.trim();
      }
      
      if (formData.weight && formData.weight.trim()) {
        productData.weight = parseFloat(formData.weight);
      }
      
      if (formData.lowStockThreshold && formData.lowStockThreshold.trim()) {
        productData.lowStockThreshold = parseInt(formData.lowStockThreshold);
      }
      
      // Handle dimensions only if at least one dimension is provided
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        productData.dimensions = {};
        if (formData.dimensions.length) productData.dimensions.length = parseFloat(formData.dimensions.length);
        if (formData.dimensions.width) productData.dimensions.width = parseFloat(formData.dimensions.width);
        if (formData.dimensions.height) productData.dimensions.height = parseFloat(formData.dimensions.height);
      }
      
      // Handle tags
      if (formData.tags && formData.tags.trim()) {
        productData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      
      // Handle SEO fields
      if (formData.seoTitle && formData.seoTitle.trim()) {
        productData.seoTitle = formData.seoTitle.trim();
      }
      
      if (formData.seoDescription && formData.seoDescription.trim()) {
        productData.seoDescription = formData.seoDescription.trim();
      }
      
      // Handle boolean fields
      productData.isFeatured = Boolean(formData.isFeatured);
      productData.isActive = Boolean(formData.isActive);

      console.log('Final product data:', productData);
      createMutation.mutate(productData);
    } catch (error) {
      console.error('Error preparing product data:', error);
      toast.error('Error preparing product data');
    }
  }, [formData, createMutation]);

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
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || ''
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdate = useCallback(() => {
    try {
      if (!selectedProduct?._id) {
        toast.error('No product selected for update');
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Use the same simple structure as the working SimpleProductsPage
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        image: formData.image || '',
        countInStock: parseInt(formData.countInStock) || 10
      };

      // Only add optional fields if they have values
      if (formData.comparePrice && formData.comparePrice.trim()) {
        productData.comparePrice = parseFloat(formData.comparePrice);
      }
      
      if (formData.subcategory && formData.subcategory.trim()) {
        productData.subcategory = formData.subcategory.trim();
      }
      
      if (formData.sku && formData.sku.trim()) {
        productData.sku = formData.sku.trim();
      }
      
      if (formData.weight && formData.weight.trim()) {
        productData.weight = parseFloat(formData.weight);
      }
      
      if (formData.lowStockThreshold && formData.lowStockThreshold.trim()) {
        productData.lowStockThreshold = parseInt(formData.lowStockThreshold);
      }
      
      // Handle dimensions only if at least one dimension is provided
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        productData.dimensions = {};
        if (formData.dimensions.length) productData.dimensions.length = parseFloat(formData.dimensions.length);
        if (formData.dimensions.width) productData.dimensions.width = parseFloat(formData.dimensions.width);
        if (formData.dimensions.height) productData.dimensions.height = parseFloat(formData.dimensions.height);
      }
      
      // Handle tags
      if (formData.tags && formData.tags.trim()) {
        productData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      
      // Handle SEO fields
      if (formData.seoTitle && formData.seoTitle.trim()) {
        productData.seoTitle = formData.seoTitle.trim();
      }
      
      if (formData.seoDescription && formData.seoDescription.trim()) {
        productData.seoDescription = formData.seoDescription.trim();
      }
      
      // Handle boolean fields
      productData.isFeatured = Boolean(formData.isFeatured);
      productData.isActive = Boolean(formData.isActive);

      console.log('Final update data:', productData);
      updateMutation.mutate({ id: selectedProduct._id, data: productData });
    } catch (error) {
      console.error('Error preparing update data:', error);
      toast.error('Error preparing update data');
    }
  }, [formData, selectedProduct, updateMutation]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target ? e.target.value : e;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = (product) => {
    if (product.countInStock === 0) {
      return { label: 'Out of Stock', variant: 'destructive' };
    } else if (product.countInStock <= (product.lowStockThreshold || 10)) {
      return { label: 'Low Stock', variant: 'secondary' };
    } else {
      return { label: 'In Stock', variant: 'default' };
    }
  };

  const ProductForm = React.memo(({ isEdit = false }) => (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              value={formData.sku}
              onChange={handleInputChange('sku')}
              placeholder="Product SKU"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description">Description *</Label>
          <Textarea
            id="product-description"
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Enter product description"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-category">Category *</Label>
            <Input
              id="product-category"
              value={formData.category}
              onChange={handleInputChange('category')}
              placeholder="e.g., Activities"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-subcategory">Subcategory</Label>
            <Input
              id="product-subcategory"
              value={formData.subcategory}
              onChange={handleInputChange('subcategory')}
              placeholder="e.g., Smartphones"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-brand">Brand *</Label>
            <Input
              id="product-brand"
              value={formData.brand}
              onChange={handleInputChange('brand')}
              placeholder="Brand name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-price">Price *</Label>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange('price')}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-compare-price">Compare Price</Label>
            <Input
              id="product-compare-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.comparePrice}
              onChange={handleInputChange('comparePrice')}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-image">Main Image URL *</Label>
          <Input
            id="product-image"
            value={formData.image}
            onChange={handleInputChange('image')}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-tags">Tags</Label>
          <Input
            id="product-tags"
            value={formData.tags}
            onChange={handleInputChange('tags')}
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-sm text-muted-foreground">Separate tags with commas</p>
        </div>
      </TabsContent>

      <TabsContent value="inventory" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-stock">Stock Quantity *</Label>
            <Input
              id="product-stock"
              type="number"
              min="0"
              value={formData.countInStock}
              onChange={handleInputChange('countInStock')}
              placeholder="10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-low-stock">Low Stock Threshold</Label>
            <Input
              id="product-low-stock"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={handleInputChange('lowStockThreshold')}
              placeholder="10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-weight">Weight (kg)</Label>
          <Input
            id="product-weight"
            type="number"
            step="0.01"
            min="0"
            value={formData.weight}
            onChange={handleInputChange('weight')}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label>Dimensions (cm)</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.dimensions.length}
              onChange={handleInputChange('dimensions.length')}
              placeholder="Length"
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.dimensions.width}
              onChange={handleInputChange('dimensions.width')}
              placeholder="Width"
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.dimensions.height}
              onChange={handleInputChange('dimensions.height')}
              placeholder="Height"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="seo" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-seo-title">SEO Title</Label>
          <Input
            id="product-seo-title"
            value={formData.seoTitle}
            onChange={handleInputChange('seoTitle')}
            placeholder="SEO optimized title (max 60 characters)"
            maxLength={60}
          />
          <p className="text-sm text-muted-foreground">
            {formData.seoTitle.length}/60 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-seo-description">SEO Description</Label>
          <Textarea
            id="product-seo-description"
            value={formData.seoDescription}
            onChange={handleInputChange('seoDescription')}
            placeholder="Brief description for search engines (max 160 characters)"
            maxLength={160}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            {formData.seoDescription.length}/160 characters
          </p>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="product-featured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
          />
          <Label htmlFor="product-featured">Featured Product</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="product-active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="product-active">Active Product</Label>
        </div>
      </TabsContent>
    </Tabs>
  ));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ProductForm />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Products</Label>
              <Input
                id="search"
                placeholder="Search by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Activities">Activities</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-createdAt">Newest First</SelectItem>
                  <SelectItem value="createdAt">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="-name">Name Z-A</SelectItem>
                  <SelectItem value="price">Price Low-High</SelectItem>
                  <SelectItem value="-price">Price High-Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({totalProducts})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Loading products...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-destructive">Error loading products: {error.message}</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">No products found. Create your first product!</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        <img
                          src={product.image || ''}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = '';
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.sku && (
                            <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{product.category}</div>
                          {product.subcategory && (
                            <div className="text-sm text-muted-foreground">{product.subcategory}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatPrice(product.price)}</div>
                          {product.comparePrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.comparePrice)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.countInStock}</div>
                          <Badge variant={stockStatus.variant} className="text-xs">
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.isFeatured && (
                            <Badge variant="outline">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm isEdit={true} />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSimpleProductsPage;

