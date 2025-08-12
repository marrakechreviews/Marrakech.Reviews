import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Star, TrendingUp, Activity, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/marrakech-architecture-hero.jpg';
import desertImage from '../assets/images/marrakech-desert.jpg';
import souksImage from '../assets/images/marrakech-souks.jpg';

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const slides = [
    {
      id: 1,
      image: heroImage,
      title: "Discover the Magic of",
      animatedWord: "Marrakech",
      subtitle: "Your trusted guide to the best restaurants, hotels, attractions, and hidden gems in Morocco's enchanting Red City",
      searchPlaceholder: "Search for restaurants, hotels, attractions...",
      buttons: [
        {
          text: "Browse Reviews",
          icon: Star,
          link: "/reviews",
          variant: "primary"
        },
        {
          text: "Share Your Experience",
          icon: TrendingUp,
          link: "/add-review",
          variant: "outline"
        }
      ]
    },
    {
      id: 2,
      image: desertImage,
      title: "Unforgettable Adventures in",
      animatedWord: "Morocco",
      subtitle: "From camel treks in the Sahara to cooking classes in traditional riads, discover authentic experiences that will create memories for a lifetime",
      searchPlaceholder: "Search for desert tours, cooking classes, hiking...",
      buttons: [
        {
          text: "Explore Activities",
          icon: Activity,
          link: "/activities",
          variant: "primary"
        },
        {
          text: "Book Adventure",
          icon: MapPin,
          link: "/activities",
          variant: "outline"
        }
      ]
    },
    {
      id: 3,
      image: souksImage,
      title: "Hidden Gems &",
      animatedWord: "Recommendations",
      subtitle: "Discover secret spots, local favorites, and must-visit places that only insiders know about. Let us guide you to the real Morocco",
      searchPlaceholder: "Search for hidden gems, local spots, recommendations...",
      buttons: [
        {
          text: "View Recommendations",
          icon: Star,
          link: "/recommendations",
          variant: "primary"
        },
        {
          text: "Explore Places",
          icon: MapPin,
          link: "/places",
          variant: "outline"
        }
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="block transition-all duration-500">
            {currentSlideData.title}
          </span>
          <span className="block text-primary animate-pulse-glow">
            {currentSlideData.animatedWord}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-gray-200 transition-all duration-500">
          {currentSlideData.subtitle}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex bg-white rounded-lg p-2 shadow-lg">
            <Input
              type="text"
              placeholder={currentSlideData.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 text-foreground"
            />
            <Button type="submit" size="sm" className="ml-2">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentSlideData.buttons.map((button, index) => {
            const Icon = button.icon;
            return (
              <Button
                key={index}
                asChild
                size="lg"
                variant={button.variant === 'primary' ? 'default' : 'outline'}
                className={
                  button.variant === 'primary'
                    ? 'bg-primary hover:bg-primary/90'
                    : 'border-white text-black bg-white hover:bg-gray-100 hover:text-black'
                }
              >
                <Link to={button.link}>
                  <Icon className="mr-2 h-5 w-5" />
                  {button.text}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6);
            transform: scale(1.02);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSlideshow;

