import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Package, Clock, CheckCircle, XCircle, AlertTriangle, Mail, RefreshCw } from 'lucide-react';

const ReturnsPage = () => {
  const [activeTab, setActiveTab] = useState('policy');

  const returnReasons = [
    { reason: 'Defective/Damaged', eligible: true, timeframe: '30 days', refundType: 'Full refund + shipping' },
    { reason: 'Wrong item sent', eligible: true, timeframe: '30 days', refundType: 'Full refund + shipping' },
    { reason: 'Not as described', eligible: true, timeframe: '14 days', refundType: 'Full refund' },
    { reason: 'Changed mind', eligible: true, timeframe: '14 days', refundType: 'Refund minus shipping' },
    { reason: 'Size/fit issues', eligible: true, timeframe: '14 days', refundType: 'Exchange or refund' },
    { reason: 'Quality concerns', eligible: true, timeframe: '14 days', refundType: 'Full refund' }
  ];

  const nonReturnableItems = [
    'Personalized or custom-made items',
    'Food items and perishables',
    'Items damaged by misuse',
    'Items without original packaging',
    'Items purchased with special discounts over 50%'
  ];

  const returnSteps = [
    {
      step: 1,
      title: 'Contact Us',
      description: 'Email us within the return timeframe with your order number and reason for return.',
      icon: Mail
    },
    {
      step: 2,
      title: 'Get Authorization',
      description: 'We\'ll provide a Return Authorization Number (RAN) and return instructions.',
      icon: CheckCircle
    },
    {
      step: 3,
      title: 'Package Item',
      description: 'Pack the item securely in original packaging with all accessories and documentation.',
      icon: Package
    },
    {
      step: 4,
      title: 'Ship Back',
      description: 'Send the package using our provided shipping label or your preferred carrier.',
      icon: RotateCcw
    },
    {
      step: 5,
      title: 'Processing',
      description: 'We\'ll inspect the item and process your refund or exchange within 5-7 business days.',
      icon: RefreshCw
    }
  ];

  return (
    <>
      <Helmet>
        <title>Returns & Exchanges - Marrakech Reviews</title>
        <meta 
          name="description" 
          content="Learn about our return and exchange policy. Easy returns within 30 days for most items. Customer satisfaction guaranteed." 
        />
        <meta name="keywords" content="returns policy, exchanges, refunds, Marrakech products, customer satisfaction" />
        <meta property="og:title" content="Returns & Exchanges - Marrakech Reviews" />
        <meta property="og:description" content="Easy returns and exchanges for your peace of mind" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Returns & Exchanges
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your satisfaction is our priority. Easy returns and exchanges for peace of mind.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Free Return Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="policy">Return Policy</TabsTrigger>
              <TabsTrigger value="process">Return Process</TabsTrigger>
              <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Return Policy Tab */}
            <TabsContent value="policy" className="space-y-8">
              {/* Overview */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    Return Policy Overview
                  </CardTitle>
                  <CardDescription className="text-lg">
                    We want you to be completely satisfied with your purchase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg">30-Day Window</h3>
                      <p className="text-gray-600">Return most items within 30 days of delivery for a full refund</p>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Original Condition</h3>
                      <p className="text-gray-600">Items must be unused and in original packaging with all accessories</p>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <RotateCcw className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Easy Process</h3>
                      <p className="text-gray-600">Simple online return process with prepaid shipping labels</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Return Eligibility */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Return Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Return Reason</th>
                          <th className="text-center py-3 px-4">Eligible</th>
                          <th className="text-center py-3 px-4">Timeframe</th>
                          <th className="text-center py-3 px-4">Refund Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnReasons.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{item.reason}</td>
                            <td className="py-3 px-4 text-center">
                              {item.eligible ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="outline">{item.timeframe}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center text-sm">{item.refundType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Non-Returnable Items */}
              <Card className="border-0 shadow-lg bg-red-50 border-red-200">
                <CardContent className="py-8">
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">
                        Non-Returnable Items
                      </h3>
                      <ul className="space-y-2">
                        {nonReturnableItems.map((item, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Return Process Tab */}
            <TabsContent value="process" className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    How to Return an Item
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Follow these simple steps to return your item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {returnSteps.map((step, index) => {
                      const IconComponent = step.icon;
                      return (
                        <div key={index} className="flex items-start space-x-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className="bg-purple-600 text-white">Step {step.step}</Badge>
                              <h3 className="font-semibold text-lg text-gray-900">{step.title}</h3>
                            </div>
                            <p className="text-gray-600">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="py-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    Start Your Return
                  </h3>
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Ready to return an item? Contact our customer service team to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild className="bg-purple-600 hover:bg-purple-700">
                        <a href="/contact">Contact Customer Service</a>
                      </Button>
                      <Button variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        returns@marrakechreviews.com
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exchanges Tab */}
            <TabsContent value="exchanges" className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    Exchanges
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Exchange your item for a different size, color, or style
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">
                        Exchange Eligibility
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">Same product in different size/color</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">Item of equal or greater value</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">Within 30 days of delivery</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">Original condition and packaging</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">
                        Exchange Process
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-600">1</span>
                          </div>
                          <span className="text-gray-600">Contact us with your exchange request</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-600">2</span>
                          </div>
                          <span className="text-gray-600">We'll check availability of desired item</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-600">3</span>
                          </div>
                          <span className="text-gray-600">Ship your item back to us</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-600">4</span>
                          </div>
                          <span className="text-gray-600">We'll send your replacement item</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exchange Fees */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Exchange Fees & Shipping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Same Value</h3>
                      <p className="text-gray-600">No additional cost for exchanges of equal value</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Higher Value</h3>
                      <p className="text-gray-600">Pay the difference for more expensive items</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RotateCcw className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
                      <p className="text-gray-600">We cover return and exchange shipping costs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    Returns FAQ
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Common questions about returns and exchanges
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        How long do refunds take to process?
                      </h3>
                      <p className="text-gray-600">
                        Once we receive and inspect your returned item, refunds are processed within 5-7 business days. The time it takes for the refund to appear in your account depends on your payment method and bank processing times.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        Can I return items purchased with a discount?
                      </h3>
                      <p className="text-gray-600">
                        Yes, items purchased with discounts up to 50% can be returned following our standard policy. Items purchased with discounts over 50% are final sale and cannot be returned unless defective.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        What if I lost my receipt or order confirmation?
                      </h3>
                      <p className="text-gray-600">
                        No problem! We can look up your order using your email address or phone number. If you paid with a credit card, we can also use the last 4 digits to locate your purchase.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        Can I return items purchased as gifts?
                      </h3>
                      <p className="text-gray-600">
                        Yes, gift recipients can return items for store credit or exchange. For cash refunds, the original purchaser must initiate the return. Gift receipts are available upon request.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact CTA */}
          <div className="mt-16">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="py-12 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Need Help with a Return?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Our customer service team is here to make your return process as smooth as possible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Contact Support
                  </a>
                  <a
                    href="mailto:returns@marrakechreviews.com"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                  >
                    Email Returns Team
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

export default ReturnsPage;

