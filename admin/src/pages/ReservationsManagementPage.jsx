import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  Users,
  DollarSign,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function ReservationsManagementPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Sample reservations data
  const sampleReservations = [
    {
      id: 1,
      reservationId: 'ACT-1K2L3M4N-ABCDE',
      activity: {
        id: 1,
        name: 'Sahara Desert Camel Trek',
        category: 'Desert Tours',
        location: 'Merzouga, Sahara Desert'
      },
      customerInfo: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 555-0123',
        whatsapp: '+1 555-0123'
      },
      reservationDate: '2024-02-15',
      numberOfPersons: 2,
      totalPrice: 240,
      status: 'Pending',
      paymentStatus: 'Pending',
      notes: 'Celebrating anniversary, would like romantic setup if possible',
      createdAt: '2024-01-20T10:30:00Z',
      confirmationSent: true,
      reminderSent: false,
      adminNotes: ''
    },
    {
      id: 2,
      reservationId: 'ACT-5P6Q7R8S-FGHIJ',
      activity: {
        id: 2,
        name: 'Marrakech Food Walking Tour',
        category: 'Food & Cooking',
        location: 'Marrakech Medina'
      },
      customerInfo: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+44 20 7946 0958',
        whatsapp: '+44 7700 900123'
      },
      reservationDate: '2024-02-10',
      numberOfPersons: 4,
      totalPrice: 180,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      notes: 'Vegetarian options needed for 2 people',
      createdAt: '2024-01-18T14:15:00Z',
      confirmationSent: true,
      reminderSent: true,
      adminNotes: 'Confirmed vegetarian arrangements with guide'
    },
    {
      id: 3,
      reservationId: 'ACT-9T0U1V2W-KLMNO',
      activity: {
        id: 3,
        name: 'Atlas Mountains Hiking',
        category: 'Adventure Sports',
        location: 'Atlas Mountains, Imlil'
      },
      customerInfo: {
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@email.com',
        phone: '+212 6XX-XXXXXX',
        whatsapp: '+212 6XX-XXXXXX'
      },
      reservationDate: '2024-02-08',
      numberOfPersons: 6,
      totalPrice: 510,
      status: 'Completed',
      paymentStatus: 'Paid',
      notes: '',
      createdAt: '2024-01-15T09:45:00Z',
      confirmationSent: true,
      reminderSent: true,
      adminNotes: 'Excellent group, left positive review'
    },
    {
      id: 4,
      reservationId: 'ACT-3X4Y5Z6A-PQRST',
      activity: {
        id: 4,
        name: 'Traditional Cooking Class',
        category: 'Food & Cooking',
        location: 'Marrakech Medina'
      },
      customerInfo: {
        name: 'Maria Rodriguez',
        email: 'maria.r@email.com',
        phone: '+34 91 123 4567',
        whatsapp: '+34 600 123 456'
      },
      reservationDate: '2024-02-12',
      numberOfPersons: 2,
      totalPrice: 130,
      status: 'Cancelled',
      paymentStatus: 'Refunded',
      notes: 'First time cooking Moroccan food',
      createdAt: '2024-01-16T16:20:00Z',
      confirmationSent: true,
      reminderSent: false,
      adminNotes: 'Customer cancelled due to flight changes, full refund processed',
      cancelledAt: '2024-01-25T11:30:00Z',
      cancellationReason: 'Flight schedule changed'
    }
  ];

  const activities = [
    'Sahara Desert Camel Trek',
    'Marrakech Food Walking Tour',
    'Atlas Mountains Hiking',
    'Traditional Cooking Class'
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setReservations(sampleReservations);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.activity.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || reservation.status === filterStatus;
    const matchesActivity = !filterActivity || reservation.activity.name === filterActivity;
    
    return matchesSearch && matchesStatus && matchesActivity;
  });

  const handleStatusChange = (reservationId, newStatus, adminNotes = '') => {
    setReservations(prev => prev.map(reservation => 
      reservation.id === reservationId 
        ? { 
            ...reservation, 
            status: newStatus,
            adminNotes: adminNotes || reservation.adminNotes,
            confirmedAt: newStatus === 'Confirmed' ? new Date().toISOString() : reservation.confirmedAt,
            cancelledAt: newStatus === 'Cancelled' ? new Date().toISOString() : reservation.cancelledAt
          }
        : reservation
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ReservationDetailDialog = ({ reservation, onClose, onStatusChange }) => {
    const [newStatus, setNewStatus] = useState(reservation?.status || '');
    const [adminNotes, setAdminNotes] = useState(reservation?.adminNotes || '');

    if (!reservation) return null;

    const handleSaveStatus = () => {
      onStatusChange(reservation.id, newStatus, adminNotes);
      onClose();
    };

    return (
      <Dialog open={!!reservation} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservation Details - {reservation.reservationId}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Activity</Label>
                      <p className="font-medium">{reservation.activity.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category</Label>
                      <p>{reservation.activity.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p>{reservation.activity.location}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reservation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date</Label>
                      <p className="font-medium">
                        {format(new Date(reservation.reservationDate), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Number of Persons</Label>
                      <p>{reservation.numberOfPersons}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Total Price</Label>
                      <p className="text-2xl font-bold text-green-600">${reservation.totalPrice}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {reservation.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="italic text-gray-700">"{reservation.notes}"</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="customer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="font-medium">{reservation.customerInfo.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <div className="flex items-center gap-2">
                        <p>{reservation.customerInfo.email}</p>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <div className="flex items-center gap-2">
                        <p>{reservation.customerInfo.phone}</p>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">WhatsApp</Label>
                      <div className="flex items-center gap-2">
                        <p>{reservation.customerInfo.whatsapp}</p>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Confirmation Email</Label>
                      <div className="flex items-center gap-2">
                        {reservation.confirmationSent ? (
                          <Badge className="bg-green-100 text-green-800">Sent</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Not Sent</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          Resend
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Reminder</Label>
                      <div className="flex items-center gap-2">
                        {reservation.reminderSent ? (
                          <Badge className="bg-green-100 text-green-800">Sent</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Reservation Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
                        <Badge className={getPaymentStatusColor(reservation.paymentStatus)}>
                          {reservation.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <Label className="font-medium text-gray-600">Created</Label>
                      <p>{format(new Date(reservation.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    {reservation.confirmedAt && (
                      <div className="text-sm">
                        <Label className="font-medium text-gray-600">Confirmed</Label>
                        <p>{format(new Date(reservation.confirmedAt), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                    )}
                    {reservation.cancelledAt && (
                      <div className="text-sm">
                        <Label className="font-medium text-gray-600">Cancelled</Label>
                        <p>{format(new Date(reservation.cancelledAt), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this reservation..."
                    rows={4}
                  />
                </CardContent>
              </Card>
              
              {reservation.status === 'Cancelled' && reservation.cancellationReason && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cancellation Reason:</strong> {reservation.cancellationReason}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={handleSaveStatus}>
                  Save Changes
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'Pending').length,
    confirmed: reservations.filter(r => r.status === 'Confirmed').length,
    completed: reservations.filter(r => r.status === 'Completed').length,
    cancelled: reservations.filter(r => r.status === 'Cancelled').length,
    totalRevenue: reservations
      .filter(r => r.paymentStatus === 'Paid')
      .reduce((sum, r) => sum + r.totalPrice, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reservations Management</h1>
          <p className="text-gray-600">Manage activity reservations and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reservations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterActivity} onValueChange={setFilterActivity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {activities.map(activity => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reservation ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Persons</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="rounded bg-gray-300 h-4 w-full"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No reservations found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {reservation.reservationId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.customerInfo.name}</div>
                          <div className="text-sm text-gray-500">{reservation.customerInfo.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.activity.name}</div>
                          <div className="text-sm text-gray-500">{reservation.activity.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(reservation.reservationDate), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {reservation.numberOfPersons}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${reservation.totalPrice}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(reservation.paymentStatus)}>
                          {reservation.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={reservation.status}
                            onValueChange={(value) => handleStatusChange(reservation.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reservation Detail Dialog */}
      <ReservationDetailDialog
        reservation={selectedReservation}
        onClose={() => {
          setSelectedReservation(null);
          setIsDetailDialogOpen(false);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

