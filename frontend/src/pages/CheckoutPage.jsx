import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import api from '../lib/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, itemsCount, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Morocco',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Order Notes
    notes: '',
    
    // Agreements
    agreeTerms: false,
    subscribeNewsletter: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'address', 'city', 'postalCode', 'country'
    ];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Payment validation for Stripe
    if (paymentMethod === 'stripe') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      }
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      }
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
    }

    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate totals
  const subtotal = total;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1; // 10% tax
  const finalTotal = subtotal + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        orderItems: items.map(item => ({
          name: item.product.name,
          qty: item.quantity,
          price: item.product.price,
          product: item.product._id
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: finalTotal,
        notes: formData.notes
      };

      console.log('Submitting order:', orderData);

      const response = await api.post('/orders', orderData);

      if (response.data) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/thank-you', { 
          state: { 
            orderId: response.data._id || response.data.data?._id,
            orderNumber: response.data.orderNumber || response.data.data?.orderNumber || `ORD-${Date.now()}`
          } 
        });
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Your Store</title>
        <meta name="description" content="Complete your purchase securely with our checkout process." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/cart')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">
              Complete your order ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className={errors.postalCode ? 'border-red-500' : ''}
                        />
                        {errors.postalCode && (
                          <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleInputChange('country', value)}
                      >
                        <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morocco">Morocco</SelectItem>
                          <SelectItem value="Algeria">Algeria</SelectItem>
                          <SelectItem value="Tunisia">Tunisia</SelectItem>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="cursor-pointer">Cash on Delivery</Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === 'stripe' && (
                      <div className="mt-6 space-y-4">
                        <div>
                          <Label htmlFor="cardName">Cardholder Name *</Label>
                          <Input
                            id="cardName"
                            value={formData.cardName}
                            onChange={(e) => handleInputChange('cardName', e.target.value)}
                            className={errors.cardName ? 'border-red-500' : ''}
                          />
                          {errors.cardName && (
                            <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            className={errors.cardNumber ? 'border-red-500' : ''}
                          />
                          {errors.cardNumber && (
                            <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                              className={errors.expiryDate ? 'border-red-500' : ''}
                            />
                            {errors.expiryDate && (
                              <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value)}
                              className={errors.cvv ? 'border-red-500' : ''}
                            />
                            {errors.cvv && (
                              <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      Order Notes (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any special instructions for your order..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Terms and Submit */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeTerms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                        />
                        <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                          I agree to the{' '}
                          <a href="/terms" className="text-primary hover:underline">
                            Terms and Conditions
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                          *
                        </Label>
                      </div>
                      {errors.agreeTerms && (
                        <p className="text-sm text-red-500">{errors.agreeTerms}</p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="subscribeNewsletter"
                          checked={formData.subscribeNewsletter}
                          onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', checked)}
                        />
                        <Label htmlFor="subscribeNewsletter" className="text-sm">
                          Subscribe to our newsletter for updates and special offers
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full mt-6"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Place Order - ${finalTotal.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product._id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.product.image || item.product.images?.[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-medium">Secure Checkout</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Your payment information is encrypted and secure
                    </p>
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

export default CheckoutPage;

