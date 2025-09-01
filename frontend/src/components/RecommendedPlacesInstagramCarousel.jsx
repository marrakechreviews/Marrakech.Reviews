import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';

const popularDestinations = [
  {
    id: 1,
    title: 'Paris, France',
    country: 'France',
    description: 'The City of Light with iconic landmarks and romantic atmosphere',
    image: '/images/destinations/paris.jpg',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral'],
  },
  {
    id: 2,
    title: 'London, United Kingdom',
    country: 'United Kingdom',
    description: 'Historic capital with royal palaces and modern attractions',
    image: '/images/destinations/london.jpg',
    highlights: ['Big Ben', 'Buckingham Palace', 'Tower Bridge'],
  },
  {
    id: 3,
    title: 'Tokyo, Japan',
    country: 'Japan',
    description: 'Modern metropolis blending tradition with cutting-edge technology',
    image: '/images/destinations/tokyo.jpg',
    highlights: ['Mount Fuji Views', 'Shibuya Crossing', 'Traditional Temples'],
  },
  {
    id: 4,
    title: 'Rome, Italy',
    country: 'Italy',
    description: 'Eternal City with ancient history and incredible architecture',
    image: '/images/destinations/rome.jpg',
    highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain'],
  },
  {
    id: 5,
    title: 'New York, USA',
    country: 'United States',
    description: 'The city that never sleeps with iconic skyline and culture',
    image: '/images/destinations/new-york.jpg',
    highlights: ['Statue of Liberty', 'Central Park', 'Times Square'],
  },
  {
    id: 6,
    title: 'Dubai, UAE',
    country: 'United Arab Emirates',
    description: 'Futuristic city with luxury shopping and stunning architecture',
    image: '/images/destinations/dubai.jpg',
    highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall'],
  },
];

const PopularDestinations = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Popular Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the world's most captivating capitals and iconic cities
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-full"
        >
          <CarouselContent className="-ml-1">
            {popularDestinations.map((destination) => (
              <CarouselItem key={destination.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                    <div className="relative overflow-hidden">
                      <img 
                        src={destination.image} 
                        alt={destination.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{destination.country}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <CardTitle className="text-xl mb-3 text-gray-900">
                        {destination.title}
                      </CardTitle>
                      <p className="text-gray-600 mb-4 flex-1">
                        {destination.description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Highlights:</h4>
                        <div className="flex flex-wrap gap-1">
                          {destination.highlights.map((highlight, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors duration-300"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Explore {destination.title}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <MapPin className="mr-2 h-5 w-5" />
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;

