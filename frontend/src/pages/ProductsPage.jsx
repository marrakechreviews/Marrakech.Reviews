import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Search from 'lucide-react/dist/esm/icons/search';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Grid from 'lucide-react/dist/esm/icons/grid';
import List from 'lucide-react/dist/esm/icons/list';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Star from 'lucide-react/dist/esm/icons/star';
import Heart from 'lucide-react/dist/esm/icons/heart';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../lib/api';
import { Helmet } from 'react-helmet-async';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const fetchProductsApi = async (params) => {
  const response = await productsAPI.getProducts(params);
  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const {
    items: products,
    loading: isLoading,
    loadingMore,
    pagination,
    filters,
    setFilters,
    loadMore,
  } = useInfiniteScroll(fetchProductsApi, {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: parseInt(searchParams.get('minPrice')) || 0,
    maxPrice: parseInt(searchParams.get('maxPrice')) || 1000,
    rating: parseInt(searchParams.get('rating')) || 0,
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'featured',
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsAPI.getCategories().then(res => res.data.data),
  });

  const totalProducts = pagination?.total || 0;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0 && value !== false) {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      rating: 0,
      inStock: false,
      sortBy: 'featured',
    });
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const generateMetaDescription = () => {
    let description = 'Discover amazing products at great prices. ';
    if (filters.category) {
      description += `Shop ${filters.category} products. `;
    }
    if (filters.search) {
      description += `Find ${filters.search} and more. `;
    }
    description += 'Free shipping, secure payment, and excellent customer service.';
    return description;
  };

  const generatePageTitle = () => {
    let title = '';
    if (filters.search) {
      title += `${filters.search} - `;
    }
    if (filters.category) {
      title += `${filters.category} - `;
    }
    title += 'Products | Your Store';
    return title;
  };

  return (
    <>
      <Helmet>
        <title>{generatePageTitle()}</title>
        <meta name="description" content={generateMetaDescription()} />
        <meta name="keywords" content={`products, shopping, ${filters.category}, ${filters.search}, online store, ecommerce`} />
        <meta property="og:title" content={generatePageTitle()} />
        <meta property="og:description" content={generateMetaDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data for Products */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": generatePageTitle(),
            "description": generateMetaDescription(),
            "url": window.location.href,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": totalProducts,
              "itemListElement": products.map((product, index) => ({
                "@type": "Product",
                "position": index + 1,
                "name": product.name,
                "description": product.description,
                "image": product.images?.[0],
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "USD",
                  "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                },
                "aggregateRating": product.averageRating ? {
                  "@type": "AggregateRating",
                  "ratingValue": product.averageRating,
                  "reviewCount": product.reviewCount || 0
                } : undefined
              }))
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              {filters.category && (
                <>
                  <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">{filters.category}</span>
                </>
              )}
              {!filters.category && <span className="text-gray-900 font-medium">Products</span>}
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {filters.category ? filters.category : 'All Products'}
                  {filters.search && (
                    <span className="text-gray-600 font-normal"> - "{filters.search}"</span>
                  )}
                </h1>
                <p className="text-gray-600 mt-2">
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
                </p>
              </div>
              
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 space-y-6`}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                  
                  {/* Categories */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Categories</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={filters.category === ''}
                          onCheckedChange={() => handleFilterChange('category', '')}
                        />
                        <span className="text-sm">All Categories</span>
                      </label>
                      {categories?.map(category => (
                        <label key={category} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filters.category === category}
                            onCheckedChange={() => handleFilterChange('category', category)}
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Price Range</h4>
                    <div className="px-2">
                      <Slider
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => {
                          handleFilterChange('minPrice', min);
                          handleFilterChange('maxPrice', max);
                        }}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>${filters.minPrice}</span>
                        <span>${filters.maxPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Minimum Rating</h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map(rating => (
                        <label key={rating} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filters.rating === rating}
                            onCheckedChange={() => handleFilterChange('rating', rating)}
                          />
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-sm ml-1">& up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Availability</h4>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.inStock}
                        onCheckedChange={(checked) => handleFilterChange('inStock', checked)}
                      />
                      <span className="text-sm">In Stock Only</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {isLoading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                      <div className="p-4 space-y-2">
                        <div className="bg-gray-200 h-4 rounded"></div>
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                        <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found matching your criteria.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map((product) => (
                    viewMode === 'grid' ? (
                      <ProductCard key={product._id} product={product} />
                    ) : (
                      <ProductListItem key={product._id} product={product} />
                    )
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {!isLoading && pagination.page < pagination.pages && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// List view component for products
function ProductListItem({ product }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        <div className="w-48 h-32 bg-gray-100 flex-shrink-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Link to={`/products/${product.slug || product._id}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({product.reviewCount || 0})
                  </span>
                </div>
                
                {product.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
              </div>
            </div>
            
            <div className="text-right ml-6">
              <div className="text-2xl font-bold text-primary">
                ${product.price}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
              
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  Only {product.stock} left!
                </p>
              )}
              {product.stock === 0 && (
                <p className="text-sm text-red-600 mt-2">Out of Stock</p>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

