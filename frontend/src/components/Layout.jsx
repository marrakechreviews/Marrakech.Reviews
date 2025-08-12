import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Menu, 
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Truck,
  Shield,
  RotateCcw,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { settingsAPI } from '../lib/api';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { itemsCount } = useCart();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getPublicSettings().then(res => res.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Articles', href: '/articles' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const categories = [
    { name: 'Activities', href: '/category/Activities' },
    { name: 'restaurants', href: '/category/restaurants' },
    { name: 'hosting', href: '/category/hosting' },
    { name: 'hidden gems', href: '/category/hidden-gems' },
    { name: 'fast food', href: '/category/fast-food' },
    { name: 'guide', href: '/category/guide' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - DISABLED */}
      {/* 
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>{settings?.general?.contactPhone || '+1 (555) 123-4567'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>{settings?.general?.contactEmail || 'contact@example.com'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span>Free shipping on orders over $50!</span>
              <div className="flex items-center space-x-2">
                {settings?.social?.facebook && (
                  <a href={settings.social.facebook} className="hover:text-white/80">
                    <Facebook className="h-3 w-3" />
                  </a>
                )}
                {settings?.social?.twitter && (
                  <a href={settings.social.twitter} className="hover:text-white/80">
                    <Twitter className="h-3 w-3" />
                  </a>
                )}
                {settings?.social?.instagram && (
                  <a href={settings.social.instagram} className="hover:text-white/80">
                    <Instagram className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <ShoppingBag className="h-8 w-8 text-red-500" />
                <span className="text-xl font-bold text-gray-900">
                  {settings?.general?.siteName || 'Your Store'}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-gray-700 hover:text-red-600 transition-colors ${
                    location.pathname === item.href ? 'text-red-600 font-medium' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
                />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
              <Button variant="ghost" size="sm" asChild className="relative">
                <Link to="/cart">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Cart
                  {itemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                      {itemsCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t pt-2 mt-2">
                <Link
                  to="/account"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Categories Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <Truck className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-gray-400">On orders over $50</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-400">100% secure transactions</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-400">30-day return policy</p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-sm text-gray-400">Premium quality products</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold">
                  {settings?.general?.siteName || 'Your Store'}
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                {settings?.general?.siteDescription || 'Your premier online shopping destination'}
              </p>
              <div className="flex space-x-4">
                {settings?.social?.facebook && (
                  <a href={settings.social.facebook} className="text-orange-500 hover:text-white">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings?.social?.twitter && (
                  <a href={settings.social.twitter} className="text-orange-500 hover:text-white">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {settings?.social?.instagram && (
                  <a href={settings.social.instagram} className="text-orange-500 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings?.social?.youtube && (
                  <a href={settings.social.youtube} className="text-orange-500 hover:text-white">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-orange-500">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-orange-500">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.name}>
                    <Link to={category.href} className="hover:text-white">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-orange-500">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{settings?.general?.contactPhone || '+1 (555) 123-4567'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{settings?.general?.contactEmail || 'contact@example.com'}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-1" />
                  <div>
                    <div>{settings?.general?.address?.street || '123 Main Street'}</div>
                    <div>
                      {settings?.general?.address?.city || 'New York'}, {settings?.general?.address?.state || 'NY'} {settings?.general?.address?.postalCode || '10001'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-orange-500 mb-4">Subscribe to our newsletter for the latest deals and updates</p>
              <form className="max-w-md mx-auto flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button type="submit" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-orange-500">
            <p>&copy; 2024 {settings?.general?.siteName || 'Your Store'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

