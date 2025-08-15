import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, HelpCircle, MapPin, Utensils, Calendar, Shield, CreditCard, Users } from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      id: 'travel',
      title: 'Travel Planning',
      icon: MapPin,
      color: 'bg-blue-100 text-blue-600',
      questions: [
        {
          question: 'What is the best time to visit Marrakech?',
          answer: 'The best time to visit Marrakech is during spring (March-May) and fall (September-November) when temperatures are mild and comfortable. Summer can be very hot (40°C+), while winter nights can be quite cool. Spring offers beautiful weather and blooming gardens, while fall provides warm days and cool evenings perfect for exploring.'
        },
        {
          question: 'How many days should I spend in Marrakech?',
          answer: 'We recommend at least 3-4 days to see the main attractions and get a feel for the city. A week allows you to explore more thoroughly, take day trips to nearby areas like the Atlas Mountains or Essaouira, and truly immerse yourself in the local culture. For a comprehensive experience including cooking classes and cultural activities, 5-7 days is ideal.'
        },
        {
          question: 'Is Marrakech safe for tourists?',
          answer: 'Yes, Marrakech is generally safe for tourists. The city has a strong tourism police presence and locals are generally welcoming to visitors. However, like any tourist destination, stay aware of your surroundings, avoid displaying expensive items, and be cautious of common tourist scams. The medina can be overwhelming at first, so consider hiring a guide for your first visit.'
        },
        {
          question: 'What should I wear in Marrakech?',
          answer: 'Dress modestly and respectfully, especially when visiting religious sites. For women, cover shoulders and knees; for men, avoid shorts in religious areas. Lightweight, breathable fabrics are best due to the climate. Comfortable walking shoes are essential for navigating the medina\'s uneven surfaces. Bring layers as temperatures can vary significantly between day and night.'
        }
      ]
    },
    {
      id: 'dining',
      title: 'Food & Dining',
      icon: Utensils,
      color: 'bg-green-100 text-green-600',
      questions: [
        {
          question: 'What are the must-try dishes in Marrakech?',
          answer: 'Essential dishes include tagine (slow-cooked stew), couscous (traditionally served on Fridays), pastilla (sweet and savory pastry), harira (hearty soup), and mint tea. Don\'t miss street food like msemen (flaky pancakes), chebakia (honey cookies), and fresh orange juice from Jemaa el-Fnaa. Each dish tells a story of Moroccan culture and tradition.'
        },
        {
          question: 'Is street food safe to eat?',
          answer: 'Street food can be safe if you choose wisely. Look for busy stalls with high turnover, hot freshly cooked food, and clean preparation areas. Avoid raw vegetables, unpeeled fruits you didn\'t peel yourself, and anything that\'s been sitting out. Trust your instincts - if something doesn\'t look or smell right, skip it. Our reviews highlight the safest and most delicious street food options.'
        },
        {
          question: 'Are there vegetarian/vegan options available?',
          answer: 'Yes! Moroccan cuisine offers many vegetarian options including vegetable tagines, couscous with vegetables, lentil dishes, and fresh salads. Many restaurants can prepare vegan versions of traditional dishes. However, be aware that some seemingly vegetarian dishes may contain meat stock, so always ask. We have a dedicated section for vegetarian and vegan-friendly restaurants.'
        },
        {
          question: 'How much should I tip at restaurants?',
          answer: 'Tipping 10-15% is standard at restaurants if service charge isn\'t included. For casual dining or cafes, rounding up the bill or leaving small change is sufficient. At street food stalls, tipping isn\'t expected but appreciated. For exceptional service, feel free to tip more. Always check if service charge is already included in your bill.'
        }
      ]
    },
    {
      id: 'booking',
      title: 'Bookings & Reservations',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      questions: [
        {
          question: 'How do I make reservations through your website?',
          answer: 'You can make reservations directly through our website by clicking the "Book Now" button on restaurant or activity pages. We partner with trusted booking platforms to ensure secure transactions. You\'ll receive confirmation emails with all necessary details. For special requests or group bookings, contact us directly for personalized assistance.'
        },
        {
          question: 'Can I cancel or modify my booking?',
          answer: 'Cancellation and modification policies vary by establishment. Most restaurants allow cancellations up to 24 hours in advance, while activities may have different policies. Check the specific terms when booking. We always recommend booking flexible rates when possible. Contact us immediately if you need to make changes, and we\'ll help coordinate with the venue.'
        },
        {
          question: 'Do you charge booking fees?',
          answer: 'We don\'t charge additional booking fees for most reservations. The price you see is the price you pay. Some premium experiences or last-minute bookings may have small processing fees, which will be clearly displayed before you confirm. We believe in transparent pricing with no hidden surprises.'
        },
        {
          question: 'What if the restaurant is closed when I arrive?',
          answer: 'While rare, if a restaurant is unexpectedly closed, contact us immediately. We\'ll help you find alternative dining options and work with the establishment to reschedule or refund your booking. We maintain close relationships with our partners to minimize such issues and ensure your experience remains positive.'
        }
      ]
    },
    {
      id: 'website',
      title: 'Website & Reviews',
      icon: HelpCircle,
      color: 'bg-orange-100 text-orange-600',
      questions: [
        {
          question: 'How do you select restaurants and activities to review?',
          answer: 'We personally visit every establishment we review. Our selection process considers authenticity, quality, value for money, and unique experiences. We prioritize local favorites, hidden gems, and places that offer genuine Moroccan culture. We don\'t accept payment for positive reviews - our recommendations are based solely on merit and personal experience.'
        },
        {
          question: 'How often do you update your reviews?',
          answer: 'We update reviews regularly, typically every 3-6 months for popular establishments and annually for others. If we receive reports of significant changes, we prioritize re-visiting those places. Menu changes, price updates, and service quality shifts are reflected in our reviews. Follow our social media for real-time updates and new discoveries.'
        },
        {
          question: 'Can I submit my own review or recommendation?',
          answer: 'Absolutely! We welcome recommendations from fellow travelers. Use our contact form to suggest places you\'ve discovered. While we can\'t guarantee we\'ll review every suggestion, we investigate all recommendations. If you\'re a local business owner, we\'d love to hear from you too - authentic local experiences are what we\'re all about.'
        },
        {
          question: 'Do you offer personalized travel planning?',
          answer: 'Yes! We offer personalized itinerary planning services for travelers who want a customized experience. Our local experts can create detailed plans based on your interests, budget, and travel style. This premium service includes restaurant reservations, activity bookings, and insider tips. Contact us for more information about our travel planning packages.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment & Pricing',
      icon: CreditCard,
      color: 'bg-red-100 text-red-600',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for our services. For restaurant and activity bookings, payment methods vary by establishment. Most accept credit cards, but some local places may be cash-only. We always indicate payment methods accepted on each listing.'
        },
        {
          question: 'Are prices shown in local currency?',
          answer: 'Prices are typically shown in Moroccan Dirhams (MAD) with USD/EUR equivalents for reference. Exchange rates are updated regularly, but actual charges may vary slightly based on your bank\'s exchange rate. We recommend checking current exchange rates before your trip and budgeting accordingly.'
        },
        {
          question: 'Do you offer group discounts?',
          answer: 'Many of our partner restaurants and activity providers offer group discounts for parties of 8 or more. Group rates vary by establishment and season. Contact us with your group size and preferences, and we\'ll negotiate the best possible rates. Corporate and special event bookings receive additional consideration.'
        },
        {
          question: 'What is your refund policy?',
          answer: 'Refund policies vary by service provider. Generally, cancellations made 24-48 hours in advance receive full refunds. Last-minute cancellations may incur fees. Weather-related cancellations for outdoor activities typically receive full refunds. We work with our partners to ensure fair and flexible policies for our customers.'
        }
      ]
    },
    {
      id: 'local',
      title: 'Local Culture & Customs',
      icon: Users,
      color: 'bg-pink-100 text-pink-600',
      questions: [
        {
          question: 'What are important cultural customs to know?',
          answer: 'Respect local customs by dressing modestly, especially in religious areas. Remove shoes when entering mosques or traditional homes. Use your right hand for eating and greeting. During Ramadan, be respectful of those fasting. Learn basic Arabic/French greetings - locals appreciate the effort. Bargaining is expected in souks but be respectful and fair.'
        },
        {
          question: 'Is it appropriate to take photos of people?',
          answer: 'Always ask permission before photographing people, especially in traditional dress or working. Many people in tourist areas may expect a small tip for photos. Avoid photographing people praying or in religious contexts. Street performers in Jemaa el-Fnaa often expect payment for photos. Respect privacy and cultural sensitivities.'
        },
        {
          question: 'What languages are spoken in Marrakech?',
          answer: 'Arabic and Berber (Amazigh) are official languages. French is widely spoken due to colonial history. In tourist areas, many people speak English, Spanish, and Italian. Learning basic Arabic phrases like "Shukran" (thank you) and "Salam" (hello) is appreciated. Most restaurant menus in tourist areas are multilingual.'
        },
        {
          question: 'How should I handle haggling in the souks?',
          answer: 'Haggling is part of the culture and expected in souks. Start by offering 30-50% of the asking price and negotiate from there. Be patient, friendly, and prepared to walk away - this often leads to better prices. Don\'t haggle if you\'re not seriously interested in buying. Fixed-price shops will display "Prix Fixe" signs.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <>
      <Helmet>
        <title>FAQ - Frequently Asked Questions | Marrakech Reviews</title>
        <meta 
          name="description" 
          content="Find answers to frequently asked questions about traveling to Marrakech, dining, bookings, and using our website. Get expert advice for your Morocco trip." 
        />
        <meta name="keywords" content="Marrakech FAQ, Morocco travel questions, dining guide, booking help, travel tips" />
        <meta property="og:title" content="FAQ - Marrakech Reviews" />
        <meta property="og:description" content="Get answers to your Marrakech travel questions" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Everything you need to know about traveling to Marrakech
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Expert Answers</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Local Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Community Driven</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="py-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="container mx-auto px-4 pb-16">
          {filteredCategories.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse our categories below.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900">
                            {category.title}
                          </CardTitle>
                          <CardDescription>
                            {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, index) => (
                          <AccordionItem key={index} value={`${category.id}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardContent className="py-12 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Still have questions?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Our team is here to help with any additional questions about your Marrakech adventure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Contact Us
                  </a>
                  <a
                    href="/articles"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                  >
                    Read Our Guides
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

export default FAQPage;

