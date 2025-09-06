import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Send from 'lucide-react/dist/esm/icons/send';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
   try {
     const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://marrakech-reviews-backend.vercel.app/api'}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Marrakech Reviews</title>
        <meta 
          name="description" 
          content="Get in touch with Marrakech Reviews. We're here to help with your travel questions, feedback, and partnership inquiries." 
        />
        <meta name="keywords" content="Contact Marrakech Reviews, travel help, Morocco questions, feedback, partnerships" />
        <meta property="og:title" content="Contact Us - Marrakech Reviews" />
        <meta property="og:description" content="Get in touch with our travel experts" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              We're here to help make your Marrakech experience unforgettable
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Quick Response</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Expert Advice</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Local Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Have a question or need assistance? We'd love to hear from you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="travel">Travel Planning</SelectItem>
                          <SelectItem value="review">Review Question</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Brief description of your inquiry"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800">
                          Thank you for your message! We'll get back to you within 24 hours.
                        </p>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">
                          Sorry, there was an error sending your message. Please try again.
                        </p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Get in Touch
                  </CardTitle>
                  <CardDescription>
                    Multiple ways to reach our team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">info@marrakechreviews.com</p>
                      <p className="text-sm text-gray-500">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">+212 524 123 456</p>
                      <p className="text-sm text-gray-500">Available 9 AM - 6 PM (GMT+1)</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Location</h3>
                      <p className="text-gray-600">Marrakech, Morocco</p>
                      <p className="text-sm text-gray-500">Local expertise, global reach</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 9 AM - 6 PM</p>
                      <p className="text-gray-600">Saturday: 10 AM - 4 PM</p>
                      <p className="text-sm text-gray-500">GMT+1 (Morocco Time)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Link */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="py-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Find quick answers to common questions about traveling to Marrakech, our services, and more.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/faq">
                      View FAQ
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-0 shadow-lg">
                <CardContent className="py-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Follow Us
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Stay updated with our latest reviews and travel tips on social media.
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.instagram.com/marrakechreviews"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors"
                    >
                      Instagram
                    </a>
                    <a
                      href="#"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Facebook
                    </a>
                    <a
                      href="#"
                      className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Twitter
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsPage;

