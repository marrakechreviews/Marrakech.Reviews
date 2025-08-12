import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const PopularDestinations = () => {
  const destinations = [
    {
      name: 'Marrakech',
      image: '/images/destinations/marrakech.png',
      description: 'The Red City, a vibrant hub of culture and history.',
      link: '/destinations/marrakech',
    },
    {
      name: 'Fes',
      image: '/images/destinations/fes.png',
      description: 'Morocco\'s cultural capital, known for its ancient medina.',
      link: '/destinations/fes',
    },
    {
      name: 'Chefchaouen',
      image: '/images/destinations/chefchaouen.png',
      description: 'The blue pearl of Morocco, nestled in the Rif Mountains.',
      link: '/destinations/chefchaouen',
    },
    {
      name: 'Essaouira',
      image: '/images/destinations/essaouira.png',
      description: 'A charming coastal town with a relaxed atmosphere.',
      link: '/destinations/essaouira',
    },
    {
      name: 'Casablanca',
      image: '/images/destinations/casablanca.png',
      description: 'Morocco\'s largest city, a bustling economic and cultural hub.',
      link: '/destinations/casablanca',
    },
    {
      name: 'Tangier',
      image: '/images/destinations/tangier.png',
      description: 'The gateway to Africa, with a rich history and vibrant atmosphere.',
      link: '/destinations/tangier',
    },
    {
      name: 'Agadir',
      image: '/images/destinations/agadir.png',
      description: 'A modern city on the Atlantic coast, known for its beaches and golf courses.',
      link: '/destinations/agadir',
    },
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Popular Destinations
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore the most sought-after cities and regions in Morocco.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((destination, index) => (
            <Card key={index} className="overflow-hidden group">
              <Link to={destination.link}>
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-xl font-semibold mb-2">
                    {destination.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {destination.description}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;