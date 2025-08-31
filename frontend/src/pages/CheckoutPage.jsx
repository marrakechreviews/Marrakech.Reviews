import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import InformationStep from '../components/checkout/InformationStep';
import ShippingStep from '../components/checkout/ShippingStep';
import PaymentStep from '../components/checkout/PaymentStep';
import OrderSummary from '../components/checkout/OrderSummary';
import CheckoutBreadcrumbs from '../components/checkout/CheckoutBreadcrumbs';
import ExpressCheckout from '../components/checkout/ExpressCheckout';
import { Separator } from '@/components/ui/separator';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, itemsCount, clearCart } = useCart();
  const [step, setStep] = useState('information');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Morocco',
    notes: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
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

  const handleNext = () => {
    if (step === 'information' && validateForm()) {
      setStep('shipping');
    } else if (step === 'shipping') {
      setStep('payment');
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('shipping');
    } else if (step === 'shipping') {
      setStep('information');
    }
  };

  const onPaymentSuccess = (data) => {
    clearCart();
    navigate('/thank-you', {
      state: {
        orderId: data.order._id,
        orderNumber: data.order.orderNumber
      }
    });
  };

  const onPaymentError = () => {
    // Handle payment error
  };

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
    paymentMethod: 'PayPal', // This will be set in PaymentStep
    itemsPrice: total,
    shippingPrice: total > 50 ? 0 : 10,
    taxPrice: total * 0.1,
    totalPrice: total + (total > 50 ? 0 : 10) + (total * 0.1),
    notes: formData.notes
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Your Store</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ExpressCheckout orderData={orderData} onPaymentSuccess={onPaymentSuccess} onPaymentError={onPaymentError} />
          <Separator className="my-8" />
          <CheckoutBreadcrumbs currentStep={step} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {step === 'information' && (
                <InformationStep
                  formData={formData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  onNext={handleNext}
                />
              )}
              {step === 'shipping' && (
                <ShippingStep onNext={handleNext} onBack={handleBack} />
              )}
              {step === 'payment' && (
                <PaymentStep
                  onBack={handleBack}
                  orderData={orderData}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={onPaymentError}
                  validateForm={validateForm}
                />
              )}
            </div>
            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
