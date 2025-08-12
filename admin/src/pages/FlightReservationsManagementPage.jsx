import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  Plane, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Calendar as CalendarIcon,
  Users,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const FlightReservationsManagementPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    totalCommission: 0,
    averagePrice: 0
  });

  // Mock data for demonstration
  const mockReservations = [
    {
      _id: '1',
      bookingReference: 'FL-ABC123',
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        whatsapp: '+1234567890'
      },
      flightDetails: {
        tripType: 'round-trip',
        departure: {
          airport: 'JFK',
          city: 'New York',
          country: 'USA',
          date: new Date('2024-03-15')
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          country: 'France',
          date: new Date('2024-03-22')
        },
        passengers: {
          adults: 2,
          children: 1,
          infants: 0
        },
        class: 'economy'
      },
      pricing: {
        basePrice: 1200,
        taxes: 150,
        fees: 50,
        totalPrice: 1400,
        currency: 'USD',
        referralCommission: 84
      },
      referralInfo: {
        supplier: 'skyscanner',
        commissionRate: 6
      },
      status: 'confirmed',
      createdAt: new Date('2024-02-15'),
      specialRequests: 'Window seat preferred'
    },
    {
      _id: '2',
      bookingReference: 'FL-DEF456',
      customerInfo: {
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@email.com',
        phone: '+1987654321',
        whatsapp: '+1987654321'
      },
      flightDetails: {
        tripType: 'one-way',
        departure: {
          airport: 'LAX',
          city: 'Los Angeles',
          country: 'USA',
          date: new Date('2024-04-10')
        },
        arrival: {
          airport: 'NRT',
          city: 'Tokyo',
          country: 'Japan'
        },
        passengers: {
          adults: 1,
          children: 0,
          infants: 0
        },
        class: 'business'
      },
      pricing: {
        basePrice: 2800,
        taxes: 200,
        fees: 75,
        totalPrice: 3075,
        currency: 'USD',
        referralCommission: 123
      },
      referralInfo: {
        supplier: 'expedia',
        commissionRate: 4
      },
      status: 'pending',
      createdAt: new Date('2024-02-20')
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReservations(mockReservations);
      setStats({
        totalReservations: mockReservations.length,
        totalRevenue: mockReservations.reduce((sum, r) => sum + r.pricing.totalPrice, 0),
        totalCommission: mockReservations.reduce((sum, r) => sum + r.pricing.referralCommission, 0),
        averagePrice: mockReservations.reduce((sum, r) => sum + r.pricing.totalPrice, 0) / mockReservations.length
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSupplierColor = (supplier) => {
    switch (supplier) {
      case 'skyscanner':
        return 'bg-blue-100 text-blue-800';
      case 'expedia':
        return 'bg-yellow-100 text-yellow-800';
      case 'booking':
        return 'bg-green-100 text-green-800';
      case 'kayak':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.flightDetails.departure.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.flightDetails.arrival.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || reservation.referralInfo.supplier === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const handleViewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setIsViewDialogOpen(true);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setIsEditDialogOpen(true);
  };

  const handleDeleteReservation = (reservationId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      setReservations(prev => prev.filter(r => r._id !== reservationId));
    }
  };

  const handleUpdateStatus = (reservationId, newStatus) => {
    setReservations(prev => 
      prev.map(r => 
        r._id === reservationId 
          ? { ...r, status: newStatus }
          : r
      )
    );
  };

  const exportReservations = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    console.log('Exporting reservations:', filteredReservations);
    alert('Export functionality would be implemented here!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Plane className="mr-3 h-8 w-8 text-blue-600" />
            Flight Reservations
          </h1>
          <p className="text-gray-600 mt-2">Manage flight bookings and track commissions</p>
        </div>
        <Button onClick={exportReservations} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalCommission.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-gray-900">${Math.round(stats.averagePrice).toLocaleString()}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search reservations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  <SelectItem value="skyscanner">Skyscanner</SelectItem>
                  <SelectItem value="expedia">Expedia</SelectItem>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="kayak">Kayak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Filter</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Reservations ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Booking Ref</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Route</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Passengers</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Commission</th>
                  <th className="text-left p-4 font-medium">Supplier</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{reservation.bookingReference}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(reservation.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {reservation.customerInfo.firstName} {reservation.customerInfo.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.customerInfo.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{reservation.flightDetails.departure.city}</span>
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{reservation.flightDetails.arrival.city}</span>
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {reservation.flightDetails.tripType.replace('-', ' ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {format(new Date(reservation.flightDetails.departure.date), 'MMM dd, yyyy')}
                      </div>
                      {reservation.flightDetails.arrival.date && (
                        <div className="text-sm text-gray-500">
                          Return: {format(new Date(reservation.flightDetails.arrival.date), 'MMM dd')}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                          {reservation.flightDetails.passengers.adults + 
                           reservation.flightDetails.passengers.children + 
                           reservation.flightDetails.passengers.infants}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {reservation.flightDetails.class}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {reservation.pricing.currency} {reservation.pricing.totalPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-green-600">
                        ${reservation.pricing.referralCommission.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.referralInfo.commissionRate}%
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getSupplierColor(reservation.referralInfo.supplier)}>
                        {reservation.referralInfo.supplier}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(reservation.status)}
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReservation(reservation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReservation(reservation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReservation(reservation._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Reservation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flight Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Booking Reference</Label>
                  <p>{selectedReservation.bookingReference}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedReservation.status)}
                    <Badge className={getStatusColor(selectedReservation.status)}>
                      {selectedReservation.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Customer Information</Label>
                <div className="mt-2 space-y-2">
                  <p><strong>Name:</strong> {selectedReservation.customerInfo.firstName} {selectedReservation.customerInfo.lastName}</p>
                  <p><strong>Email:</strong> {selectedReservation.customerInfo.email}</p>
                  <p><strong>Phone:</strong> {selectedReservation.customerInfo.phone}</p>
                  <p><strong>WhatsApp:</strong> {selectedReservation.customerInfo.whatsapp}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Flight Details</Label>
                <div className="mt-2 space-y-2">
                  <p><strong>Trip Type:</strong> {selectedReservation.flightDetails.tripType.replace('-', ' ')}</p>
                  <p><strong>Route:</strong> {selectedReservation.flightDetails.departure.city}, {selectedReservation.flightDetails.departure.country} → {selectedReservation.flightDetails.arrival.city}, {selectedReservation.flightDetails.arrival.country}</p>
                  <p><strong>Departure:</strong> {selectedReservation.flightDetails.departure.airport} - {format(new Date(selectedReservation.flightDetails.departure.date), 'PPP')}</p>
                  {selectedReservation.flightDetails.arrival.date && (
                    <p><strong>Return:</strong> {selectedReservation.flightDetails.arrival.airport} - {format(new Date(selectedReservation.flightDetails.arrival.date), 'PPP')}</p>
                  )}
                  <p><strong>Passengers:</strong> {selectedReservation.flightDetails.passengers.adults} Adult(s), {selectedReservation.flightDetails.passengers.children} Child(ren), {selectedReservation.flightDetails.passengers.infants} Infant(s)</p>
                  <p><strong>Class:</strong> {selectedReservation.flightDetails.class}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Pricing</Label>
                <div className="mt-2 space-y-2">
                  <p><strong>Base Price:</strong> {selectedReservation.pricing.currency} {selectedReservation.pricing.basePrice.toLocaleString()}</p>
                  <p><strong>Taxes:</strong> {selectedReservation.pricing.currency} {selectedReservation.pricing.taxes.toLocaleString()}</p>
                  <p><strong>Fees:</strong> {selectedReservation.pricing.currency} {selectedReservation.pricing.fees.toLocaleString()}</p>
                  <p><strong>Total:</strong> {selectedReservation.pricing.currency} {selectedReservation.pricing.totalPrice.toLocaleString()}</p>
                  <p><strong>Commission:</strong> ${selectedReservation.pricing.referralCommission.toLocaleString()} ({selectedReservation.referralInfo.commissionRate}%)</p>
                </div>
              </div>

              {selectedReservation.specialRequests && (
                <div>
                  <Label className="font-semibold">Special Requests</Label>
                  <p className="mt-2">{selectedReservation.specialRequests}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Select
                  value={selectedReservation.status}
                  onValueChange={(newStatus) => handleUpdateStatus(selectedReservation._id, newStatus)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlightReservationsManagementPage;

