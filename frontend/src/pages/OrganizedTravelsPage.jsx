import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Users,
  Star,
  Search,
  Calendar,
  DollarSign,
  Heart,
  Share2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '../lib/api';

export default function OrganizedTravelsPage() {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const response = await api.get('/organized-travel');
        setPrograms(response.data);
      } catch (error) {
        console.error('Failed to fetch travel programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleProgramClick = (program) => {
    navigate(`/travels/${program.destination}`);
  };

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Organized Travels - Explore Curated Trips in Morocco | E-Store</title>
        <meta
          name="description"
          content="Discover our collection of organized travel programs in Morocco. Unforgettable experiences, expert guides, and all-inclusive packages."
        />
        <meta name="keywords" content="morocco travel, organized tours, marrakech trips, desert safari, cultural tours" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Organized Travel Programs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Embark on a journey of a lifetime with our expertly curated travel packages.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by destination or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Programs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card
                  key={program._id || program.title}
                  className="cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => handleProgramClick(program)}
                >
                  <div className="relative">
                    <img
                      src={program.heroImage || '/placeholder.jpg'}
                      alt={program.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Badge className="bg-primary">
                        {program.destination}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                        {program.title}
                      </h3>
                      <div className="text-right ml-2">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-primary">
                            ${program.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">per person</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {program.subtitle}
                    </p>

                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{program.duration}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Up to {program.maxGroupSize} people</span>
                    </div>

                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredPrograms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No travel programs found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
