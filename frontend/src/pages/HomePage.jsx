import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Search,
  Star,
  MapPin,
  Users,
  BookOpen,
  TrendingUp,
  Utensils,
  Building,
  Camera,
  ShoppingBag,
  Sparkles,
  Activity,
  Package,
  Truck,
  Shield,
  Award,
  Compass
} from 'lucide-react';
import api from '../lib/api';
import { animateOnScroll, staggerAnimation, createFloatingAnimation } from '../lib/animations';
import HeroSlideshow from '../components/HeroSlideshow';
import TravelpayoutsFlightsWidget from '../components/TravelpayoutsFlightsWidget';
import TravelpayoutsFourPartWidget from '../components/TravelpayoutsFourPartWidget';
import RecommendedPlacesInstagramCarousel from '../components/RecommendedPlacesInstagramCarousel';
import InstagramSection from '../components/InstagramSection';
import PopularDestinations from '../components/PopularDestinations';
import souksImage from '../assets/images/marrakech-souks.jpg';
import foodImage from '../assets/images/marrakech-food.jpg';
import desertImage from '../assets/images/marrakech-desert.jpg';
import riadImage from '../assets/images/marrakech-riad.jpg';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [homepageSections, setHomepageSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const productsRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, sectionsResponse] = await Promise.all([
          api.get('/products?limit=6&featured=true'),
          api.get('/homepage-sections')
        ]);
        setProducts(productsResponse.data.products || []);
        setHomepageSections(sectionsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize animations after component mounts and data loads
  useEffect(() => {
    if (!loading) {
      // Animate category cards with stagger effect
      const categoryCards = document.querySelectorAll('.category-card');
      if (categoryCards.length > 0) {
        staggerAnimation(Array.from(categoryCards), 150, 'fade-in-up');
      }

      // Animate product cards
      const productCards = document.querySelectorAll('.product-card-hover');
      if (productCards.length > 0) {
        animateOnScroll(Array.from(productCards), 'scale-in');
      }

      // Animate stats with stagger
      const statCards = document.querySelectorAll('.stat-card');
      if (statCards.length > 0) {
        staggerAnimation(Array.from(statCards), 100, 'fade-in-up');
      }

      // Add floating animation to hero elements
      const floatingElements = document.querySelectorAll('.floating');
      floatingElements.forEach(element => {
        createFloatingAnimation(element, 8, 4000);
      });
    }
  }, [loading, products]);

  const categories = [
    {
      name: 'Activities',
      icon: Compass,
      count: '150+',
      color: 'bg-red-100 text-red-600',
      href: '/Activities',
    },
    {
      name: 'restaurants',
      icon: Utensils,
      count: '280+',
      color: 'bg-red-100 text-red-600',
      href: '/articles',
    },
    {
      name: 'hosting',
      icon: MapPin,
      count: '120+',
      color: 'bg-red-100 text-red-600',
      href: 'https://tp.media/click?shmarker=666986&promo_id=7523&source_type=link&type=click&campaign_id=101&trs=451574&journey_id=NRRMDQb20Kvmwopr_QsXi&trace_id=Zz4316d516ceaa4115959b1df-666986&promo_kind=tp_long&page_url=http%3A%2F%2Flocalhost%3A3000%2F&product_type=tp_manual&install_type=partner',
    },
    {
      name: 'hidden gems',
      icon: Star,
      count: '90+',
      color: 'bg-red-100 text-red-600',
      href: 'https://tp.media/click?shmarker=666986&promo_id=7523&source_type=link&type=click&campaign_id=101&trs=451574&journey_id=NRRMDQb20Kvmwopr_QsXi&trace_id=Zz4316d516ceaa4115959b1df-666986&promo_kind=tp_long&page_url=http%3A%2F%2Flocalhost%3A3000%2F&product_type=tp_manual&install_type=partner',
    },
    {
      name: 'fast food',
      icon: Utensils,
      count: '200+',
      color: 'bg-red-100 text-red-600',
      href: '/articles',
    },
    {
      name: 'guide',
      icon: BookOpen,
      count: '45+',
      color: 'bg-red-100 text-red-600',
      href: 'https://www.instagram.com/marrakechreviews/',
    },
  ];

  const featuredProducts = products.slice(0, 3);

  const stats = [
    { label: 'Activities', value: '52 +', icon: Package },
    { label: 'Happy Customers', value: '7,000+', icon: Users },
    { label: 'Reservervation', value: '5,000+', icon: Truck },
    { label: 'Years of Trust', value: '2+', icon: Award },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Function to check if a section is enabled
  const isSectionEnabled = (sectionName) => {
    const section = Array.isArray(homepageSections) ? homepageSections.find(s => s.name === sectionName) : undefined;
    return section ? section.enabled : true; // Default to enabled if not found
  };

  // Function to get section order
  const getSectionOrder = (sectionName) => {
    const section = Array.isArray(homepageSections) ? homepageSections.find(s => s.name === sectionName) : undefined;
    return section ? section.order : 999; // Default high order if not found
  };

  // Function to render sections in order
  const renderSections = () => {
    const sections = [
      { name: 'hero', component: <HeroSlideshow key="hero" /> },
      {
        name: 'categories',
        component: (
          <section key="categories" className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Shop by Category
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Find exactly what you're looking for in our carefully curated categories
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Link key={index} to={category.href}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${category.color} group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-semibold mb-2">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.count} items
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )
      },
      { name: 'instagram', component: <InstagramSection key="instagram" /> },
     
      {
        name: 'features',
        component: (
          <section key="features" className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Choose Our Marrakech Experiences?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Your trusted partner for an unforgettable journey in the Red City
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-red-100 rounded-full mb-6">
                    <Truck className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Seamless Booking</h3>
                  <p className="text-gray-600">
                    Effortless online booking for all your Marrakech adventures.
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-red-100 rounded-full mb-6">
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Authentic Experiences</h3>
                  <p className="text-gray-600">
                    Curated selection of genuine Marrakech cultural and travel experiences.
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-red-100 rounded-full mb-6">
                    <Award className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Local Expertise</h3>
                  <p className="text-gray-600">
                    Benefit from our deep knowledge of Marrakech to discover its true essence.
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-red-100 rounded-full mb-6">
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Dedicated Support</h3>
                  <p className="text-gray-600">
                    Our team is always ready to assist you with your travel plans.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )
      },
      { 
        name: 'google-reviews', 
        component: (
          <section key="google-reviews" className="py-16 bg-gray-100">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Hear from those who have experienced the magic of Marrakech with us.
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < 4.8 ? 'text-red-600 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">4.8 / 5</span>
                <span className="text-lg text-gray-600">(Based on 247 reviews)</span>
              </div>
              <Button asChild size="lg">
                <Link to="/reviews">
                  <Star className="mr-2 h-5 w-5 text-red-600" />
                  Read All Reviews
                </Link>
              </Button>
            </div>
          </section>
        )
      },
      {
        name: 'hosting',
        component: (
          <section key="hosting" className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Find Your Perfect Stay
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Discover unique accommodations and book your unforgettable experience in Marrakech.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/images/accommodations/luxury-hotel.jpg" 
                      alt="Luxury Hotels" 
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3">Luxury Hotels</h3>
                    <p className="text-gray-600 mb-4">Experience world-class comfort and service in our premium hotel selections.</p>
                    <Button asChild variant="outline" className="w-full">
                      <a href="https://tp.media/click?shmarker=666986&promo_id=7523&source_type=link&type=click&campaign_id=101&trs=451574" target="_blank" rel="noopener noreferrer">
                        Explore Hotels
                      </a>
                    </Button>
                  </div>
                </Card>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/images/accommodations/traditional-riad.jpg" 
                      alt="Traditional Riads" 
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3">Traditional Riads</h3>
                    <p className="text-gray-600 mb-4">Experience authentic Moroccan hospitality in our hand-picked luxury riads.</p>
                    <Button asChild variant="outline" className="w-full">
                      <a href="https://tp.media/click?shmarker=666986&promo_id=7523&source_type=link&type=click&campaign_id=101&trs=451574" target="_blank" rel="noopener noreferrer">
                        Explore Riads
                      </a>
                    </Button>
                  </div>
                </Card>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/images/accommodations/modern-apartment.jpg" 
                      alt="Modern Apartments" 
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3">Modern Apartments</h3>
                    <p className="text-gray-600 mb-4">Enjoy the comfort of home with our stylish apartment rentals.</p>
                    <Button asChild variant="outline" className="w-full">
                      <a href="https://tp.media/click?shmarker=666986&promo_id=7523&source_type=link&type=click&campaign_id=101&trs=451574" target="_blank" rel="noopener noreferrer">
                        Discover Apartments
                      </a>
                    </Button>
                  </div>
                </Card>
              </div>
              <Button asChild size="lg">
                <a href="https://tp.media/click?shmarker=666986&promo_id=7523&source_type=link&type=click&campaign_id=101&trs=451574" target="_blank" rel="noopener noreferrer">
                  <MapPin className="mr-2 h-5 w-5 text-red-600" />
                  View All Hosting Options
                </a>
              </Button>
            </div>
          </section>
        )
      },
      {
        name: 'activities',
        component: (
          <section key="activities" className="py-16 bg-gray-100">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore Marrakech Activities
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Dive into the vibrant culture and breathtaking landscapes of Marrakech with our curated activities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <Card className="p-6">
                  <img src="/images/marrakechactivities/desert-tour.jpg" alt="Desert Tour" className="w-full h-48 object-cover rounded-lg mb-4" loading="lazy" />
                  <h3 className="text-xl font-bold mb-2">Desert Adventures</h3>
                  <p className="text-gray-600 mb-4">Camel treks, quad biking, and overnight stays under the stars.</p>
                  <Button asChild variant="outline">
                    <Link to="/activities">
                      Explore Desert Tours
                    </Link>
                  </Button>
                </Card>
                <Card className="p-6">
                  <img src="/images/marrakechactivities/traditional-food.jpg" alt="Cooking Class" className="w-full h-48 object-cover rounded-lg mb-4" loading="lazy" />
                  <h3 className="text-xl font-bold mb-2">Cooking Classes</h3>
                  <p className="text-gray-600 mb-4">Learn to prepare authentic Moroccan dishes with local chefs.</p>
                  <Button asChild variant="outline">
                    <Link to="/activities">
                      Book a Class
                    </Link>
                  </Button>
                </Card>
                <Card className="p-6">
                  <img src="/images/marrakechactivities/souks-shopping.jpg" alt="Souks Shopping" className="w-full h-48 object-cover rounded-lg mb-4" loading="lazy" />
                  <h3 className="text-xl font-bold mb-2">Cultural Immersion</h3>
                  <p className="text-gray-600 mb-4">Discover the bustling souks, historic sites, and vibrant culture.</p>
                  <Button asChild variant="outline">
                    <Link to="/activities">
                      Discover Culture
                    </Link>
                  </Button>
                </Card>
              </div>
              <Button asChild size="lg">
                <Link to="/activities">
                  <Activity className="mr-2 h-5 w-5 text-red-600" />
                  View All Activities
                </Link>
              </Button>
            </div>
          </section>
        )
      },
      {
        name: 'flights',
        component: (
          <section key="flights" className="py-16 flex justify-center">
            <div className="text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">Find Your Flight</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Search and compare the best flight deals for your trip.
              </p>
              <TravelpayoutsFlightsWidget />
            </div>
          </section>
        )
      },
      {
        name: 'four-part-widget',
        component: (
          <section key="four-part-widget" className="py-16">
            <div className="container mx-auto px-4">
              <TravelpayoutsFourPartWidget />
            </div>
          </section>
        )
      },

      {
        name: 'stats',
        component: (
          <section key="stats" className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                        <Icon className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {stat.value}
                      </div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )
      },
      // {
      //   name: 'instagram',
      //   component: <InstagramSection key="instagram" />
      // },
      {
        name: 'cta',
        component: (
          <section key="cta" className="py-16 bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start an activity?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of satisfied customers and discover amazing activities at unbeatable prices
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="btn-hover-lift">
                  <Link to="/activities">
                    <ShoppingBag className="mr-2 h-5 w-5 text-red-600" />
                    Browse activities
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-black hover:bg-white hover:text-red-600 btn-hover-lift"
                >
                  <Link to="/activities">
                    <Sparkles className="mr-2 h-5 w-5" />
                    View Special Offers
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )
      }
    ];

    // Filter enabled sections and sort by order
    return sections
      .filter(section => isSectionEnabled(section.name))
      .sort((a, b) => getSectionOrder(a.name) - getSectionOrder(b.name))
      .map(section => section.component);
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Your Store - Premium Online Shopping Experience</title>
        <meta name="description" content="Discover amazing products with unbeatable prices. Shop Activities, fashion, home goods and more with fast shipping and excellent customer service." />
        <meta name="keywords" content="online shopping, ecommerce, products, deals, fashion, Activities, home" />
      </Helmet>

      <div className="space-y-0">
        {renderSections()}
      </div>
    </div>
  );
};

export default HomePage;

