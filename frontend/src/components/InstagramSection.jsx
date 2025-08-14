import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import InstagramReelGrid from './InstagramReelGrid';
import { Instagram, ExternalLink } from 'lucide-react';

const InstagramSection = () => {
  const [settings, setSettings] = useState({
    social: {
      instagramLogoUrl: ''
    }
  });

  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
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
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            {settings.social.instagramLogoUrl ? (
              <img src={settings.social.instagramLogoUrl} alt="Instagram" className="h-12 w-12 text-pink-500" />
            ) : (
              <Instagram className="h-12 w-12 text-pink-500" />
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Follow Our Instagram Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover the beauty of Marrakech through our lens. Get inspired by our latest adventures, 
            hidden gems, and authentic experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Link to="/instagram" className="inline-flex items-center">
                <Instagram className="mr-2 h-5 w-5" />
                See All Videos
              </Link>
            </Button>
            <Button 
              variant="outline" 
              asChild
              className="border-pink-500 text-pink-500 hover:bg-pink-50"
            >
              <a 
                href="https://www.instagram.com/marrakechreviews/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Instagram className="mr-2 h-4 w-4" />
                Follow @marrakechreviews
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Featured Videos Grid */}
        <InstagramReelGrid
          title=""
          featured={true}
          limit={6}
          className="mb-8"
        />

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Want to see more? Explore our complete video collection!
          </p>
          <Button variant="outline" asChild>
            <Link to="/instagram">
              View All Instagram Videos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;

