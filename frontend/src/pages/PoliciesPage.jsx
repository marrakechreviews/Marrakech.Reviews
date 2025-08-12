import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, 
  FileText, 
  RefreshCw, 
  CreditCard,
  Users,
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function PoliciesPage() {
  const policies = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      content: {
        lastUpdated: 'December 2024',
        sections: [
          {
            title: 'Information We Collect',
            content: 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes your name, email address, phone number, and travel preferences.'
          },
          {
            title: 'How We Use Your Information',
            content: 'We use the information we collect to provide, maintain, and improve our services, process bookings, communicate with you, and personalize your experience with our Marrakech travel services.'
          },
          {
            title: 'Information Sharing',
            content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.'
          },
          {
            title: 'Data Security',
            content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
          },
          {
            title: 'Your Rights',
            content: 'You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.'
          }
        ]
      }
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      content: {
        lastUpdated: 'December 2024',
        sections: [
          {
            title: 'Acceptance of Terms',
            content: 'By accessing and using our Marrakech travel guide services, you accept and agree to be bound by the terms and provision of this agreement.'
          },
          {
            title: 'Service Description',
            content: 'We provide travel information, booking services, and guided experiences for visitors to Marrakech, Morocco. Our services include restaurant recommendations, accommodation bookings, activity planning, and local guides.'
          },
          {
            title: 'User Responsibilities',
            content: 'Users are responsible for providing accurate information, following local laws and customs, and treating our guides and partners with respect during their Marrakech experience.'
          },
          {
            title: 'Intellectual Property',
            content: 'All content on our platform, including text, graphics, logos, and images, is the property of our company or our content suppliers and is protected by copyright laws.'
          },
          {
            title: 'Limitation of Liability',
            content: 'We strive to provide accurate information, but we cannot guarantee the completeness or accuracy of all content. Users travel at their own risk and responsibility.'
          }
        ]
      }
    },
    {
      id: 'cancellation',
      title: 'Cancellation Policy',
      icon: RefreshCw,
      content: {
        lastUpdated: 'December 2024',
        sections: [
          {
            title: 'Cancellation Timeframes',
            content: 'Cancellations made 48+ hours before the scheduled activity receive a full refund. Cancellations made 24-48 hours before receive a 50% refund. Cancellations made less than 24 hours before are non-refundable.'
          },
          {
            title: 'Weather-Related Cancellations',
            content: 'In case of severe weather conditions that make activities unsafe, we will offer a full refund or reschedule your experience at no additional cost.'
          },
          {
            title: 'Emergency Cancellations',
            content: 'We understand that emergencies happen. In case of medical emergencies or other unforeseen circumstances, please contact us immediately to discuss your options.'
          },
          {
            title: 'Group Bookings',
            content: 'Group bookings (5+ people) may have different cancellation terms. Please refer to your booking confirmation for specific details.'
          },
          {
            title: 'Refund Processing',
            content: 'Approved refunds will be processed within 5-7 business days to the original payment method used for the booking.'
          }
        ]
      }
    },
    {
      id: 'payment',
      title: 'Payment Policy',
      icon: CreditCard,
      content: {
        lastUpdated: 'December 2024',
        sections: [
          {
            title: 'Accepted Payment Methods',
            content: 'We accept major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through encrypted connections.'
          },
          {
            title: 'Payment Timing',
            content: 'Full payment is required at the time of booking for most services. Some premium experiences may require a deposit with the balance due before the activity date.'
          },
          {
            title: 'Currency and Pricing',
            content: 'All prices are displayed in USD unless otherwise specified. Prices may vary based on season, group size, and specific requirements.'
          },
          {
            title: 'Additional Fees',
            content: 'Prices include all specified services. Additional fees may apply for special requests, transportation outside standard pickup areas, or premium upgrades.'
          },
          {
            title: 'Price Changes',
            content: 'Once a booking is confirmed and paid, the price is guaranteed. We reserve the right to adjust prices for future bookings based on market conditions.'
          }
        ]
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>Policies - Marrakech Travel Guide</title>
        <meta name="description" content="Read our privacy policy, terms of service, cancellation policy, and payment terms for Marrakech travel services." />
        <meta name="keywords" content="policies, terms, privacy, cancellation, payment, marrakech, travel, legal" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Our Policies
              </h1>
              <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
                Transparent terms and policies to ensure a smooth and trustworthy travel experience in Marrakech.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: 'Secure & Safe', desc: 'Your data is protected' },
                { icon: CheckCircle, title: 'Transparent', desc: 'Clear terms & conditions' },
                { icon: Users, title: 'Customer First', desc: 'Your satisfaction matters' },
                { icon: Lock, title: 'Privacy Protected', desc: 'We respect your privacy' }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Policies Content */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="privacy" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
                {policies.map((policy) => {
                  const Icon = policy.icon;
                  return (
                    <TabsTrigger 
                      key={policy.id} 
                      value={policy.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{policy.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {policies.map((policy) => {
                const Icon = policy.icon;
                return (
                  <TabsContent key={policy.id} value={policy.id}>
                    <Card className="shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl text-gray-900">
                              {policy.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              Last updated: {policy.content.lastUpdated}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="space-y-8">
                          {policy.content.sections.map((section, index) => (
                            <div key={index}>
                              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {section.title}
                              </h3>
                              <p className="text-gray-700 leading-relaxed">
                                {section.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
              <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions About Our Policies?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                If you have any questions about these policies or need clarification on any terms, 
                please don't hesitate to contact our customer support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors"
                >
                  Contact Support
                </a>
                <a 
                  href="mailto:legal@marrakechguide.com" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Email Legal Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

