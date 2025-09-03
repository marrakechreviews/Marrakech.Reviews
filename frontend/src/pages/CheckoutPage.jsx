import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  ArrowLeft,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import api from '../lib/api';
import PayPalWrapper from '../components/PayPalWrapper';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, itemsCount, clearCart } = useCart();
  const { isAuthenticated, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const paymentMethod = 'PayPal';
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

    // Order Notes
    notes: '',

    // Agreements
    agreeTerms: false,
    subscribeNewsletter: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, isLoading, items, navigate, location]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone',
      'address', 'city', 'postalCode', 'country'
    ];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subtotal = total;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const finalTotal = subtotal + shipping + tax;

  const onPaymentSuccess = (order) => {
    clearCart();
    navigate('/thank-you', {
      state: {
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });
  };

  const onPaymentError = () => {
    setLoading(false);
  };

  const handlePayPalClick = (data, actions) => {
    if (!validateForm()) {
      toast.error('Please fill out all required fields correctly before proceeding.');
      return actions.reject();
    }
    setLoading(true);
    return actions.resolve();
  };

  if (items.length === 0) {
    return null;
  }

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

  return (
    <>
      <Helmet>
        <title>Checkout | Your Store</title>
        <meta name="description" content="Complete your purchase securely with our checkout process." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" value={formData.postalCode} onChange={(e) => handleInputChange('postalCode', e.target.value)} />
                      {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morocco">Morocco</SelectItem>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Agreements */}
              <Card>
                <CardHeader>
                  <CardTitle>Agreements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="agreeTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the <a href="/policies" target="_blank" className="text-blue-600 hover:underline">terms and conditions</a>
                      </label>
                    </div>
                  </div>
                  {errors.agreeTerms && <p className="text-red-500 text-sm mt-2">{errors.agreeTerms}</p>}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    You will be redirected to PayPal to complete your payment securely.
                  </p>
                  <PayPalWrapper
                    orderData={orderData}
                    onClick={handlePayPalClick}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={onPaymentError}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              {/* ... */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
