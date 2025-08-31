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
import PayPalButton from '../components/PayPalButton';

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
        orderId: order.order._id,
        orderNumber: order.order.orderNumber
      }
    });
  };

  const onPaymentError = () => {
    setLoading(false);
  };

  const handleStripeSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    // Stripe payment logic would go here
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
                  {/* Form fields */}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    {/* Stripe and Cash options */}
                  </RadioGroup>
                  {paymentMethod === 'paypal' && (
                    <div className="mt-4">
                      <PayPalButton
                        orderData={orderData}
                        onPaymentSuccess={onPaymentSuccess}
                        onPaymentError={onPaymentError}
                        disabled={!validateForm()}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {paymentMethod !== 'paypal' && (
                <Button onClick={handleStripeSubmit} disabled={loading}>
                  Place Order
                </Button>
              )}
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
