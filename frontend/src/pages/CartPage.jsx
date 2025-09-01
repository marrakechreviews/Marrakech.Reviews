import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const CartPage = () => {
  const {
    items,
    total,
    itemsCount,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const shipping = total > 100 ? 0 : 10;
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - Marrakech Reviews</title>
          <meta name="description" content="Your shopping cart is empty. Browse our products and add items to your cart." />
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Button asChild size="lg">
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${itemsCount} items) - Marrakech Reviews`}</title>
        <meta name="description" content="Review your cart items and proceed to checkout." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600">{itemsCount} item{itemsCount !== 1 ? 's' : ''} in your cart</p>
              </div>
            </div>
            <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.product._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.image || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.category}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold text-red-600">
                            ${item.product.price}
                          </span>
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.product.originalPrice}
                            </span>
                          )}
                          {item.product.sale && (
                            <Badge variant="destructive" className="text-xs">
                              Sale
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-red-600 hover:text-red-700 mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemsCount} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  {shipping > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Add ${(100 - total).toFixed(2)} more to get free shipping!
                      </p>
                    </div>
                  )}

                  <Button asChild className="w-full" size="lg">
                    <Link to="/checkout">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Link>
                  </Button>

                  <div className="text-center">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/products">
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>

                  {/* Security Badges */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Secure Checkout
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">We accept:</span>
                      <div className="flex space-x-1">
                        <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">VISA</div>
                        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">MC</div>
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">PayPal</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;

