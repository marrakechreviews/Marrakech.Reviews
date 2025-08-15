import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Users, Globe, Mail, Calendar, AlertCircle } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const dataTypes = [
    {
      category: 'Personal Information',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      items: ['Name and contact details', 'Email address', 'Phone number', 'Billing and shipping addresses', 'Payment information (encrypted)']
    },
    {
      category: 'Usage Data',
      icon: Eye,
      color: 'bg-green-100 text-green-600',
      items: ['Pages visited', 'Time spent on site', 'Click patterns', 'Search queries', 'Device and browser information']
    },
    {
      category: 'Communication Data',
      icon: Mail,
      color: 'bg-purple-100 text-purple-600',
      items: ['Email correspondence', 'Customer service interactions', 'Review and feedback submissions', 'Newsletter preferences']
    },
    {
      category: 'Location Data',
      icon: Globe,
      color: 'bg-orange-100 text-orange-600',
      items: ['IP address location', 'Shipping addresses', 'Travel preferences', 'Location-based recommendations']
    }
  ];

  const rights = [
    {
      right: 'Access',
      description: 'Request a copy of the personal data we hold about you'
    },
    {
      right: 'Rectification',
      description: 'Request correction of inaccurate or incomplete data'
    },
    {
      right: 'Erasure',
      description: 'Request deletion of your personal data (right to be forgotten)'
    },
    {
      right: 'Portability',
      description: 'Request transfer of your data to another service provider'
    },
    {
      right: 'Restriction',
      description: 'Request limitation of processing of your personal data'
    },
    {
      right: 'Objection',
      description: 'Object to processing of your data for marketing purposes'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Marrakech Reviews</title>
        <meta 
          name="description" 
          content="Read our privacy policy to understand how we collect, use, and protect your personal information. Your privacy is important to us." 
        />
        <meta name="keywords" content="privacy policy, data protection, GDPR, personal information, Marrakech Reviews" />
        <meta property="og:title" content="Privacy Policy - Marrakech Reviews" />
        <meta property="og:description" content="Our commitment to protecting your privacy and personal data" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your privacy matters to us. Learn how we protect and use your information.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Secure Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Your Rights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Last Updated */}
          <div className="mb-8">
            <Card className="border-0 shadow-lg bg-blue-50 border-blue-200">
              <CardContent className="py-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Last updated: January 15, 2024</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Introduction */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Our Commitment to Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  At Marrakech Reviews, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) for European users, and we are committed to transparency about our data practices.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our website and services, you consent to the collection and use of your information as described in this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Information We Collect */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Information We Collect
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {dataTypes.map((type, index) => {
                const IconComponent = type.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">{type.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {type.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* How We Use Information */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900 text-center mb-4">
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        Service Provision
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Process bookings and reservations</li>
                        <li>• Provide customer support</li>
                        <li>• Send booking confirmations and updates</li>
                        <li>• Facilitate communication with partners</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-green-600" />
                        Website Improvement
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Analyze website usage and performance</li>
                        <li>• Improve user experience and functionality</li>
                        <li>• Develop new features and services</li>
                        <li>• Conduct research and analytics</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-purple-600" />
                        Communication
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Send newsletters and updates (with consent)</li>
                        <li>• Respond to inquiries and feedback</li>
                        <li>• Provide travel tips and recommendations</li>
                        <li>• Send important service announcements</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-red-600" />
                        Legal Compliance
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Comply with legal obligations</li>
                        <li>• Prevent fraud and abuse</li>
                        <li>• Protect our rights and property</li>
                        <li>• Respond to legal requests</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-orange-600" />
                        Personalization
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Customize content and recommendations</li>
                        <li>• Remember your preferences</li>
                        <li>• Provide location-based services</li>
                        <li>• Enhance your browsing experience</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-teal-600" />
                        Marketing (Optional)
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Send promotional offers (with consent)</li>
                        <li>• Share travel deals and discounts</li>
                        <li>• Invite participation in surveys</li>
                        <li>• Promote relevant services</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Sharing */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900 text-center mb-4">
                  Information Sharing and Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described below:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Service Providers</h3>
                    <p className="text-gray-600 text-sm">
                      We may share information with trusted third-party service providers who assist us in operating our website, conducting business, or serving users, provided they agree to keep information confidential.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Business Partners</h3>
                    <p className="text-gray-600 text-sm">
                      We may share necessary information with restaurants, hotels, and activity providers to fulfill your bookings and reservations.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Legal Requirements</h3>
                    <p className="text-gray-600 text-sm">
                      We may disclose information when required by law, court order, or government request, or to protect our rights, property, or safety.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Business Transfers</h3>
                    <p className="text-gray-600 text-sm">
                      In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the business transaction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Your Rights */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900 text-center mb-4">
                  Your Privacy Rights
                </CardTitle>
                <CardDescription className="text-center text-lg">
                  You have control over your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rights.map((right, index) => (
                    <div key={index} className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">{right.right}</h3>
                      <p className="text-gray-600 text-sm">{right.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-4">
                    To exercise any of these rights, please contact us using the information provided below.
                  </p>
                  <Badge className="bg-blue-600 text-white px-4 py-2">
                    Response time: Within 30 days
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Security */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg bg-green-50 border-green-200">
              <CardContent className="py-8">
                <div className="flex items-start space-x-4">
                  <Lock className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-2xl text-gray-900 mb-4">
                      Data Security
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                      </p>
                      <p>
                        Our security measures include encryption of sensitive data, secure server infrastructure, regular security audits, and staff training on data protection practices.
                      </p>
                      <p>
                        However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cookies and Tracking */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Cookies and Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                    <p className="text-gray-600 text-sm">Required for website functionality and cannot be disabled.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                    <p className="text-gray-600 text-sm">Help us understand how visitors interact with our website.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                    <p className="text-gray-600 text-sm">Used to deliver relevant advertisements and track campaign effectiveness.</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  You can control cookie preferences through your browser settings or our cookie consent banner.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="py-12 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Questions About Privacy?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Contact our Data Protection Officer for any privacy-related inquiries.
                </p>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/contact"
                      className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Contact Us
                    </a>
                    <a
                      href="mailto:privacy@marrakechreviews.com"
                      className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      privacy@marrakechreviews.com
                    </a>
                  </div>
                  <p className="text-sm opacity-75">
                    Marrakech Reviews, Marrakech, Morocco
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Changes to Policy */}
          <div>
            <Card className="border-0 shadow-lg bg-yellow-50 border-yellow-200">
              <CardContent className="py-8">
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">
                      Changes to This Privacy Policy
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
                      </p>
                      <p>
                        We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. For significant changes, we may also send you an email notification.
                      </p>
                      <p>
                        We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;

