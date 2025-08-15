import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import InstagramVideoGrid from '@/components/InstagramVideoGrid';
import { Instagram, Heart, MessageCircle, Eye } from 'lucide-react';

const InstagramPage = () => {
  const [settings, setSettings] = useState({
    social: {
      instagramLogoUrl: ''
    }
  });

  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/public`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  return (
    <>
      <Helmet>
        <title>Instagram Videos - Marrakech Reviews</title>
        <meta 
          name="description" 
          content="Watch our latest Instagram videos showcasing the best of Marrakech - from traditional cuisine to cultural experiences and travel tips." 
        />
        <meta name="keywords" content="Marrakech Instagram, travel videos, Morocco experiences, Marrakech culture, travel content" />
        <meta property="og:title" content="Instagram Videos - Marrakech Reviews" />
        <meta property="og:description" content="Watch our latest Instagram videos showcasing the best of Marrakech" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                {settings.social.instagramLogoUrl ? (
                  <img src={settings.social.instagramLogoUrl} alt="Instagram" className="w-12 h-12" />
                ) : (
                  <Instagram className="w-12 h-12" />
                )}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Our Instagram
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Follow our journey through Marrakech's vibrant culture, delicious cuisine, and unforgettable experiences
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Authentic Experiences</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Local Stories</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Behind the Scenes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Videos Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="mb-16">
            <InstagramVideoGrid
              title="Featured Videos"
              featured={true}
              limit={8}
              showFilters={false}
              showSearch={false}
              className="mb-16"
            />
          </div>

          {/* All Videos Section */}
          <InstagramVideoGrid
            title="All Videos"
            showFilters={true}
            showSearch={true}
            limit={12}
          />
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Follow Us on Instagram
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Stay updated with our latest adventures and get inspired for your next trip to Marrakech
            </p>
            <a
              href="https://www.instagram.com/marrakechreviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
            >
              <Instagram className="w-6 h-6" />
              <span>Follow @marrakechreviews</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstagramPage;

