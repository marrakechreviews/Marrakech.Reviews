import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Clock, MapPin, Shield, CreditCard, Globe, AlertCircle } from 'lucide-react';

const ShippingInfoPage = () => {
  const shippingZones = [
    {
      zone: 'Morocco (Domestic)',
      timeframe: '1-3 business days',
      cost: 'Free for orders over 200 MAD',
      standardCost: '25 MAD',
      icon: '🇲🇦'
    },
    {
      zone: 'Europe',
      timeframe: '5-10 business days',
      cost: 'From 45 EUR',
      standardCost: '45-75 EUR',
      icon: '🇪🇺'
    },
    {
      zone: 'North America',
      timeframe: '7-14 business days',
      cost: 'From 55 USD',
      standardCost: '55-85 USD',
      icon: '🇺🇸'
    },
    {
      zone: 'Rest of World',
      timeframe: '10-21 business days',
      cost: 'From 65 USD',
      standardCost: '65-120 USD',
      icon: '🌍'
    }
  ];

  const shippingMethods = [
    {
      name: 'Standard Shipping',
      description: 'Reliable delivery with tracking',
      timeframe: 'See zones above',
      features: ['Tracking included', 'Insurance up to 100 EUR', 'Signature required']
    },
    {
      name: 'Express Shipping',
      description: 'Faster delivery for urgent orders',
      timeframe: '2-5 business days',
      features: ['Priority handling', 'Full insurance', 'SMS notifications', 'Signature required']
    },
    {
      name: 'Local Pickup',
      description: 'Collect from our Marrakech location',
      timeframe: 'Same day',
      features: ['No shipping cost', 'Immediate availability', 'Product inspection before pickup']
    }
  ];

  return (
    <>
      <Helmet>
        <title>Shipping Information - Marrakech Reviews</title>
        <meta 
          name="description" 
          content="Learn about our shipping policies, delivery times, and costs for products from Marrakech. International shipping available worldwide." 
        />
        <meta name="keywords" content="Marrakech shipping, Morocco delivery, international shipping, product delivery" />
        <meta property="og:title" content="Shipping Information - Marrakech Reviews" />
        <meta property="og:description" content="Shipping and delivery information for our products" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Shipping Information
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Fast, reliable delivery of authentic Moroccan products worldwide
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Global Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Secure Packaging</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Tracking Included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Shipping Zones */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Shipping Zones & Rates
                </CardTitle>
                <CardDescription className="text-lg">
                  We ship authentic Moroccan products worldwide with competitive rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {shippingZones.map((zone, index) => (
                    <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-4">{zone.icon}</div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{zone.zone}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center">
                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{zone.timeframe}</span>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {zone.cost}
                          </Badge>
                          {zone.standardCost && (
                            <p className="text-xs text-gray-500">Standard: {zone.standardCost}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Methods */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Shipping Methods
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              {shippingMethods.map((method, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {index === 0 && <Truck className="w-8 h-8 text-green-600" />}
                      {index === 1 && <Package className="w-8 h-8 text-blue-600" />}
                      {index === 2 && <MapPin className="w-8 h-8 text-teal-600" />}
                    </div>
                    <CardTitle className="text-xl text-center">{method.name}</CardTitle>
                    <CardDescription className="text-center">{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {method.timeframe}
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {method.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Shipping Policies */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900 text-center mb-4">
                  Shipping Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-green-600" />
                        Order Processing
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Orders are processed within 1-2 business days</li>
                        <li>• Custom orders may require 3-5 business days</li>
                        <li>• Orders placed on weekends are processed on Monday</li>
                        <li>• You'll receive a tracking number once shipped</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        Packaging & Protection
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Eco-friendly packaging materials</li>
                        <li>• Fragile items receive extra protection</li>
                        <li>• Moisture protection for textiles</li>
                        <li>• Discrete packaging available upon request</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                        Payment & Duties
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Shipping costs calculated at checkout</li>
                        <li>• Customs duties are buyer's responsibility</li>
                        <li>• VAT may apply for EU destinations</li>
                        <li>• We provide all necessary customs documentation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-teal-600" />
                        International Shipping
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Available to most countries worldwide</li>
                        <li>• Some restrictions apply to certain products</li>
                        <li>• Delivery times may vary during peak seasons</li>
                        <li>• Remote areas may incur additional charges</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-orange-600" />
                        Delivery Timeframes
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Business days exclude weekends and holidays</li>
                        <li>• Peak seasons may extend delivery times</li>
                        <li>• Weather conditions may cause delays</li>
                        <li>• We'll notify you of any significant delays</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-red-600" />
                        Tracking & Delivery
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Real-time tracking for all shipments</li>
                        <li>• SMS and email notifications available</li>
                        <li>• Signature required for valuable items</li>
                        <li>• Safe place delivery options available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notes */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg bg-yellow-50 border-yellow-200">
              <CardContent className="py-8">
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">
                      Important Shipping Notes
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        <strong>Customs & Duties:</strong> International customers are responsible for any customs duties, taxes, or fees imposed by their country. These charges are not included in our shipping costs and vary by destination.
                      </p>
                      <p>
                        <strong>Restricted Items:</strong> Some products may have shipping restrictions to certain countries due to customs regulations. We'll inform you during checkout if any items cannot be shipped to your location.
                      </p>
                      <p>
                        <strong>Address Accuracy:</strong> Please ensure your shipping address is complete and accurate. We cannot be responsible for packages delivered to incorrect addresses provided by the customer.
                      </p>
                      <p>
                        <strong>Peak Season Delays:</strong> During Ramadan, Eid, and major holidays, shipping times may be extended. We recommend ordering early during these periods.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="py-12">
                <h3 className="text-2xl font-bold mb-4">
                  Questions About Shipping?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Our customer service team is here to help with any shipping questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Contact Support
                  </a>
                  <a
                    href="/faq"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                  >
                    View FAQ
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingInfoPage;

