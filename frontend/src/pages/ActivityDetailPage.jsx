import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Check,
  X,
  ChevronLeft,
  Share2,
  Heart,
  Info,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { activitiesAPI } from '../lib/api';

export default function ActivityDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [numberOfPersons, setNumberOfPersons] = useState(2);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log("ActivityDetailPage mounted. Slug:", slug);
    const fetchActivity = async () => {
      setLoading(true);
      console.log("Fetching activity data...");
      try {
        const response = await activitiesAPI.getActivityBySlug(slug);
        console.log("Activity data received:", response.data);
        setActivity(response.data);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
        setActivity(null); // Set activity to null on error
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [slug]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp number is required';
    }
    
    if (!selectedDate) {
      errors.date = 'Please select a reservation date';
    }
    
    if (numberOfPersons < activity.minParticipants || numberOfPersons > activity.maxParticipants) {
      errors.persons = `Number of persons must be between ${activity.minParticipants} and ${activity.maxParticipants}`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Submit button clicked. Validating form...");
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const reservationData = {
        customerInfo: formData,
        reservationDate: selectedDate.toISOString(),
        numberOfPersons,
        notes: formData.notes
      };
      
      console.log("Submitting reservation data:", reservationData);
      const response = await activitiesAPI.createReservation(activity._id, reservationData);
      console.log("Reservation successful:", response.data);
      
      navigate('/thank-you', { 
        state: { 
          reservationData: response.data,
          type: 'activity'
        } 
      });
      
    } catch (error) {
      console.error('Reservation error:', error);
      const errorMessage = error.response?.data?.message || 'There was an error submitting your reservation. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const totalPrice = activity ? activity.price * numberOfPersons : 0;
  const savings = activity ? (activity.marketPrice - activity.price) * numberOfPersons : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="h-96 bg-gray-300 rounded-lg mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-20 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Activity Not Found</h1>
          <p className="text-gray-600 mb-6">The activity you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/activities')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{activity.name} - Book Your Adventure | E-Store</title>
        <meta name="description" content={activity.shortDescription} />
        <meta name="keywords" content={`${activity.category}, ${activity.location}, ${activity.tags.join(', ')}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/activities')}
              className="p-0 h-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Activities
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{activity.category}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{activity.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Images and Details */}
            <div>
              {/* Main Image */}
              <div className="relative mb-4">
                <img
                  src={activity.images[0]}
                  alt={activity.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-primary">
                    {activity.category}
                  </Badge>
                  {activity.isFeatured && (
                    <Badge variant="secondary">
                      Featured
                    </Badge>
                  )}
                  {savings > 0 && (
                    <Badge variant="destructive">
                      Save ${savings}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {activity.images && activity.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {activity.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${activity.name} ${index + 2}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Activity Details */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Activity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{activity.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{activity.minParticipants}-{activity.maxParticipants} people</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {activity.included && activity.included.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">What's Included</h4>
                      <ul className="space-y-1">
                        {activity.included.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {activity.excluded && activity.excluded.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Not Included</h4>
                      <ul className="space-y-1">
                        {activity.excluded.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <X className="h-4 w-4 text-red-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Form */}
            <div>
              {/* Activity Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {activity.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.floor(activity.rating))}
                    <span className="font-medium ml-1">{activity.rating}</span>
                    <span className="text-gray-600">({activity.numReviews} reviews)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">
                      ${activity.price}
                    </span>
                    {activity.marketPrice > activity.price && (
                      <span className="text-lg text-gray-500 line-through">
                        ${activity.marketPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-600">per person</span>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {activity.shortDescription}
                </p>
              </div>

              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Book This Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date Selection */}
                    <div>
                      <Label>Select Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              formErrors.date ? 'border-red-500' : ''
                            }`}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {formErrors.date && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.date}</p>
                      )}
                    </div>

                    {/* Number of Persons */}
                    <div>
                      <Label>Number of Persons *</Label>
                      <Select 
                        value={numberOfPersons ? numberOfPersons.toString() : ''} 
                        onValueChange={(value) => setNumberOfPersons(parseInt(value))}
                        disabled={!activity}
                      >
                        <SelectTrigger className={formErrors.persons ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activity && Array.from({ length: activity.maxParticipants - activity.minParticipants + 1 }, (_, i) => {
                            const count = activity.minParticipants + i;
                            return (
                              <SelectItem key={count} value={count.toString()}>
                                {count} {count === 1 ? 'Person' : 'Persons'}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {formErrors.persons && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.persons}</p>
                      )}
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Contact Information</h4>
                      
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={formErrors.name ? 'border-red-500' : ''}
                          placeholder="Enter your full name"
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-10"
                            placeholder="+212 5XX XXX XXX"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                        <div className="relative">
                          <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="whatsapp"
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                            className={`pl-10 ${formErrors.whatsapp ? 'border-red-500' : ''}`}
                            placeholder="+212 6XX XXX XXX"
                          />
                        </div>
                        {formErrors.whatsapp && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.whatsapp}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Special Requests (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Any special requests or requirements..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Booking Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Activity:</span>
                          <span className="font-medium">{activity.name}</span>
                        </div>
                        {selectedDate && (
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span>{format(selectedDate, "PPP")}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Persons:</span>
                          <span>{numberOfPersons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price per person:</span>
                          <span>${activity.price}</span>
                        </div>
                        {savings > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>You save:</span>
                            <span>-${savings}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">${totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Important Notice */}
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This is a reservation request. You will receive a confirmation email with payment instructions and final details.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full" 
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Reservation Request'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Cancellation Policy</h4>
                      <p className="text-sm text-gray-600">{activity.cancellationPolicy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Description */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>About This Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.description && (
                <div className="prose max-w-none">
                  {activity.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {activity.requirements && activity.requirements.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {activity.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-500" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

