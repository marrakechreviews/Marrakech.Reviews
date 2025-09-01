import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Users from 'lucide-react/dist/esm/icons/users';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Star from 'lucide-react/dist/esm/icons/star';
import Award from 'lucide-react/dist/esm/icons/award';
import Globe from 'lucide-react/dist/esm/icons/globe';

const AboutUsPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Marrakech Reviews</title>
        <meta 
          name="description" 
          content="Learn about Marrakech Reviews - your trusted guide to authentic experiences, local cuisine, and hidden gems in the magical city of Marrakech." 
        />
        <meta name="keywords" content="About Marrakech Reviews, travel guide, Morocco, authentic experiences, local expertise" />
        <meta property="og:title" content="About Us - Marrakech Reviews" />
        <meta property="og:description" content="Your trusted guide to authentic experiences in Marrakech" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              About Marrakech Reviews
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your trusted companion for discovering the authentic soul of Marrakech
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Local Expertise</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Authentic Experiences</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Trusted Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Our Story Section */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Our Story
                </CardTitle>
                <CardDescription className="text-lg max-w-3xl mx-auto">
                  Born from a passion for Marrakech's rich culture and vibrant spirit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Marrakech Reviews was founded by a team of passionate travelers and local experts who fell in love with the magical city of Marrakech. What started as a personal journey to explore every corner of this ancient city has evolved into a comprehensive platform dedicated to sharing authentic experiences with fellow travelers.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We believe that travel is not just about visiting places, but about connecting with cultures, tasting authentic flavors, and creating memories that last a lifetime. Our mission is to bridge the gap between tourists and the real Marrakech - the one that locals know and love.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Through our carefully curated reviews, insider tips, and local partnerships, we help travelers discover hidden gems, avoid tourist traps, and experience Marrakech like a local. Every recommendation comes from personal experience and genuine passion for this incredible city.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What We Offer Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Authentic Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Honest, detailed reviews of restaurants, activities, and experiences based on real visits and genuine interactions with local businesses.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Local Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Insider knowledge and local tips that you won't find in traditional guidebooks, helping you experience Marrakech like a local.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl">Travel Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Comprehensive travel planning resources, from accommodation recommendations to detailed itineraries for different types of travelers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl">Quality Assurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Every recommendation is personally vetted by our team to ensure quality, authenticity, and value for our readers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Cultural Respect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    We promote responsible tourism that respects local culture, supports local businesses, and contributes positively to the community.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Continuous Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Our content is regularly updated to reflect changes in the city, new openings, and evolving travel conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-orange-500 text-white">Authenticity</Badge>
                      <p className="text-gray-700">
                        We believe in showcasing the real Marrakech, not just the tourist facade. Every experience we recommend is genuine and meaningful.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-red-500 text-white">Integrity</Badge>
                      <p className="text-gray-700">
                        Our reviews are honest and unbiased. We never compromise our integrity for commercial interests.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-pink-500 text-white">Community</Badge>
                      <p className="text-gray-700">
                        We support local businesses and communities, believing that tourism should benefit everyone involved.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-purple-500 text-white">Excellence</Badge>
                      <p className="text-gray-700">
                        We strive for excellence in everything we do, from our content quality to our user experience.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardContent className="py-12">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Explore Marrakech?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Join thousands of travelers who trust Marrakech Reviews for their authentic Moroccan adventure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get in Touch
                  </a>
                  <a
                    href="/articles"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                  >
                    Read Our Reviews
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

export default AboutUsPage;

