import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsAPI } from '../lib/api';
import { Button } from './ui/button';
import InstagramVideoGrid from './InstagramVideoGrid';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';

const InstagramSection = () => {
  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => settingsAPI.getPublicSettings(),
    select: (response) => response.data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            {settings?.social.instagramLogoUrl ? (
              <img src={settings.social.instagramLogoUrl} alt="Instagram" className="h-12 w-12 text-custom-orange" />
            ) : (
              <Instagram className="h-12 w-12 text-custom-orange" />
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
            <Button asChild className="bg-gradient-to-r from-custom-orange to-orange-500 hover:from-orange-500 hover:to-custom-orange">
              <Link to="/instagram" className="inline-flex items-center">
                <Instagram className="mr-2 h-5 w-5" />
                See All Videos
              </Link>
            </Button>
            <Button 
              variant="outline" 
              asChild
              className="border-custom-orange text-custom-orange hover:bg-orange-50"
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
        <InstagramVideoGrid
          title=""
          featured={true}
          limit={6}
          showFilters={false}
          showSearch={false}
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

