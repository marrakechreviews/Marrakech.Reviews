import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProductCard from '../components/ProductCard';
import ReviewsList from '../components/ReviewsList';
import api, { productsAPI, reviewsAPI } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { optimizeImage } from '../lib/image';
import { Helmet } from 'react-helmet-async';

export default function ProductDetailPage() {
  // Get the slug parameter from URL (changed from _id to slug)
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart, isInCart } = useCart();

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsAPI.getProductBySlug(slug),
    select: (response) => response.data.data,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const product = productData;

  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.category],
    queryFn: () => productsAPI.getProducts({ 
      category: product?.category, 
      limit: 4  // Use limit=4 which is well within the 50 limit
    }).then(res => {
      // Filter out current product from related products
      const products = res.data.data || [];
      return products.filter(p => p._id !== product?._id);
    }),
    enabled: !!product?.category,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', 'product', product?._id],
    queryFn: () => reviewsAPI.getReviews({ refId: product._id, refModel: 'Product' }),
    select: (response) => response.data.data,
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-gray-200 h-96 rounded-lg"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-20 w-20 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 rounded w-3/4"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                <div className="bg-gray-200 h-12 rounded w-1/3"></div>
                <div className="bg-gray-200 h-24 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    console.error('❌ Product detail page error:', error);
    const errorMessage = error?.response?.data?.message || "The product you're looking for doesn't exist or may have been removed.";
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/products">Browse All Products</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Go to Homepage</Link>
            </Button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Looking for: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{slug}</span></p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = () => {
    toast.success('Product added to wishlist!');
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product URL copied to clipboard!');
    }
  };

  const generateStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images || [product.image],
    "sku": product.sku || product._id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Your Store"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Your Store"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.numReviews || 0
    } : undefined
  });

  // Prepare images array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : ['/placeholder-product.jpg'];

  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description;
  const keywords = product.seoKeywords ? product.seoKeywords.join(', ') : `${product.name}, ${product.category}, ${product.brand}`;
  const image = productImages[0];
  const url = window.location.href;

  return (
    <>
      <Helmet>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        {url && <link rel="canonical" href={url} />}

        {/* Open Graph tags */}
        {url && <meta property="og:url" content={url} />}
        {title && <meta property="og:title" content={title} />}
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="product" />
        {image && <meta property="og:image" content={image} />}

        {/* Twitter Card tags */}
        {title && <meta name="twitter:title" content={title} />}
        {description && <meta name="twitter:description" content={description} />}
        {image && <meta name="twitter:image" content={image} />}

        {product && (
          <script type="application/ld+json">
            {JSON.stringify(generateStructuredData(product))}
          </script>
        )}
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
              <span className="text-gray-400">/</span>
              {product.category && (
                <>
                  <Link to={`/products?category=${product.category}`} className="text-gray-500 hover:text-gray-700">
                    {product.category}
                  </Link>
                  <span className="text-gray-400">/</span>
                </>
              )}
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative bg-white rounded-lg overflow-hidden aspect-square">
                <img
                  src={optimizeImage(productImages[selectedImage], 800)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
                  onClick={() => {/* Implement zoom functionality */}}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                {productImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                      onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : productImages.length - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                      onClick={() => setSelectedImage(prev => prev < productImages.length - 1 ? prev + 1 : 0)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={optimizeImage(image, 160)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Button variant="ghost" size="sm" onClick={shareProduct}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)
                    </span>
                  </div>
                  {product.sku && (
                    <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-primary">${product.price}</div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-xl text-gray-500 line-through">${product.originalPrice}</div>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <Badge variant="destructive">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Brand */}
              {product.brand && (
                <div>
                  <h3 className="font-semibold mb-2">Brand</h3>
                  <Badge variant="outline">{product.brand}</Badge>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                        disabled={quantity >= product.countInStock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.countInStock} available
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.countInStock === 0 ? 'Out of Stock' : isInCart(product._id) ? 'Add More' : 'Add to Cart'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToWishlist}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="description" className="mt-12">
            <TabsList>
              <TabsTrigger value="description">Full Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="prose max-w-none">
                <p>{product.longDescription || product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <ReviewsList reviews={reviews} isLoading={reviewsLoading} />
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

