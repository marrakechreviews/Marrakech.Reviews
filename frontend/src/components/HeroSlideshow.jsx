import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Activity, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import TravelpayoutsHeroWidget from './TravelpayoutsHeroWidget';
import heroImage from '../assets/images/marrakech-architecture-hero.jpg';
import desertImage from '../assets/images/marrakech-desert.jpg';
import souksImage from '../assets/images/marrakech-souks.jpg';
import riadImage from '../assets/images/marrakech-riad.jpg';
import foodImage from '../assets/images/marrakech-food.jpg';

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: heroImage,
      mobileImage: riadImage,
      title: "Discover the Magic of",
      animatedWord: "Marrakech",
      subtitle: "Your trusted guide to the best restaurants, hotels, attractions, and hidden gems in Morocco's enchanting Red City",
    },
    {
      id: 2,
      image: desertImage,
      mobileImage: foodImage,
      title: "Unforgettable Adventures in",
      animatedWord: "Morocco",
      subtitle: "From camel treks in the Sahara to cooking classes in traditional riads, discover authentic experiences that will create memories for a lifetime",
    },
    {
      id: 3,
      image: souksImage,
      mobileImage: riadImage,
      title: "Hidden Gems &",
      animatedWord: "Recommendations",
      subtitle: "Discover secret spots, local favorites, and must-visit places that only insiders know about. Let us guide you to the real Morocco",
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


  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <picture key={slide.id}>
          <source media="(max-width: 768px)" srcSet={slide.mobileImage || slide.image} />
          <source media="(min-width: 769px)" srcSet={slide.image} />
          <img
            src={slide.image}
            alt={slide.title}
            width="1600"
            height="900"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>
      ))}
      <div className="absolute inset-0 bg-black/60" />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200"
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

        {/* Travelpayouts Widget */}
        <div className="max-w-4xl mx-auto mb-8">
          <TravelpayoutsHeroWidget />
        </div>
      </div>
    </section>
  );
};

export default HeroSlideshow;
