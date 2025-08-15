import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Facebook, Twitter, Instagram, Mail, Phone, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Marrakech Reviews</h3>
                <p className="text-sm text-gray-400">Authentic Travel Experiences</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted guide to authentic Marrakech experiences. We offer honest reviews, 
              local insights, and curated travel recommendations for unforgettable adventures.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/marrakechreviews" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/articles" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Reviews & Articles
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Activities
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Local Products
                </Link>
              </li>
              <li>
                <Link to="/instagram" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Instagram Videos
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Marrakech, Morocco<br />
                  Local expertise, global reach
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">+212 708 040 530</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">Hello@marrakechreviews.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Marrakech Reviews. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/returns" className="text-gray-400 hover:text-white transition-colors text-sm">
                Returns
              </Link>
              <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                Shipping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

