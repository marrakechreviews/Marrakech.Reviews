import React from 'react';
import { Link } from 'react-router-dom';
import Star from 'lucide-react/dist/esm/icons/star';
import Heart from 'lucide-react/dist/esm/icons/heart';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Eye from 'lucide-react/dist/esm/icons/eye';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { IntelligentOptimizedImage } from '../lib/cloudflare-image-optimization';

export default function ProductCard({ product }) {
  const {
    _id,
    name,
    description,
    price,
    originalPrice,
    images,
    image,
    rating,
    averageRating,
    numReviews,
    reviewCount,
    category,
    inStock,
    stock,
    countInStock,
    slug,
    isOnSale,
    isFeatured
  } = product;

  const { addToCart, isInCart } = useCart();

  // Use slug if available, otherwise fall back to _id
  const productUrl = `/products/${slug || _id}`;
  
  const finalRating = averageRating || rating || 0;
  const finalReviewCount = reviewCount || numReviews || 0;
  const finalStock = countInStock !== undefined ? countInStock : (stock !== undefined ? stock : (inStock ? 10 : 0));
  
  const discountPercentage = originalPrice && originalPrice > price 
    ? Math.round((1 - price / originalPrice) * 100) 
    : 0;

  // Handle product image - use images array or single image
  const productImage = images && images.length > 0 ? images[0] : image;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (finalStock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      addToCart(product, 1);
      toast.success(`${name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white rounded-2xl">
      <div className="relative overflow-hidden">
        <Link to={productUrl}>
          <div className="aspect-square bg-gray-100 overflow-hidden">
            {productImage ? (
              <IntelligentOptimizedImage
                src={productImage}
                alt={name}
                width={400}
                height={400}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                📦
              </div>
            )}
          </div>
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOnSale && discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs font-semibold">
              -{discountPercentage}%
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold">
              ⭐ Featured
            </Badge>
          )}
          {finalStock <= 5 && finalStock > 0 && (
            <Badge variant="outline" className="bg-white/90 text-orange-600 border-orange-200 text-xs">
              Only {finalStock} left
            </Badge>
          )}
          {finalStock === 0 && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200"
            asChild
          >
            <Link to={productUrl}>
              <Eye className="h-4 w-4 text-gray-600" />
            </Link>
          </Button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full"
            disabled={finalStock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {finalStock === 0 ? 'Out of Stock' : isInCart(_id) ? 'Add More' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category */}
        {category && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs text-gray-600 bg-gray-100">
              {category}
            </Badge>
          </div>
        )}

        {/* Product Name */}
        <Link to={productUrl}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Rating */}
        {finalRating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(finalRating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {finalRating.toFixed(1)} ({finalReviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${price?.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Mobile Add to Cart */}
          <Button
            size="sm"
            className="md:hidden bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full px-3"
            disabled={finalStock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

