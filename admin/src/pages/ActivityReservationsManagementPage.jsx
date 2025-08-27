import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Calendar,
  Users,
  Clock,
  Phone,
  Mail,
  MessageCircle,
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
import { activitiesAPI } from '../lib/api';
import { toast } from 'sonner';

export default function ActivityReservationsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: reservationsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['activityReservations', searchTerm, filterStatus, filterActivity],
    queryFn: () => activitiesAPI.getReservations({ limit: 50 })
  });

  const reservations = reservationsResponse?.reservations || [];
  const pagination = reservationsResponse?.pagination || {};

  const { data: activitiesResponse } = useQuery({
    queryKey: ['activitiesList'],
    queryFn: () => activitiesAPI.getActivities({ limit: 1000 }) // Assuming this exists
  });
  const activities = activitiesResponse?.activities || [];

  useEffect(() => {
    console.log('Reservations Response from API:', reservationsResponse);
  }, [reservationsResponse]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => activitiesAPI.updateReservationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activityReservations']);
      toast.success('Reservation status updated successfully');
      setIsDetailDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const handleStatusChange = (reservationId, newStatus, adminNotes = '') => {
    updateStatusMutation.mutate({
      id: reservationId,
      data: { status: newStatus, adminNotes }
    });
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

  const ReservationDetailDialog = ({ reservation, onClose, onStatusChange }) => {
    const [newStatus, setNewStatus] = useState(reservation?.status || '');
    const [adminNotes, setAdminNotes] = useState(reservation?.adminNotes || '');

    useEffect(() => {
        if (reservation) {
            setNewStatus(reservation.status);
            setAdminNotes(reservation.adminNotes || '');
        }
    }, [reservation]);

    if (!reservation) return null;

    const handleSaveStatus = () => {
      onStatusChange(reservation._id, newStatus, adminNotes);
    };

    return (
      <Dialog open={!!reservation} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservation Details - {reservation.reservationId || reservation._id}</DialogTitle>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={handleSaveStatus} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  const stats = {
    total: pagination.total || 0,
    pending: reservations.filter(r => r.status === 'Pending').length,
    confirmed: reservations.filter(r => r.status === 'Confirmed').length,
    completed: reservations.filter(r => r.status === 'Completed').length,
    cancelled: reservations.filter(r => r.status === 'Cancelled').length,
    totalRevenue: reservations
      .filter(r => r.status === 'Confirmed' || r.status === 'Completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activity Reservations</h1>
          <p className="text-gray-600">Manage activity reservations and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
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
                  placeholder="Search by customer, email or activity..."
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
                  <SelectItem key={activity._id} value={activity._id}>
                    {activity.name}
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
          <CardTitle>Reservations ({pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Persons</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="rounded bg-gray-300 h-4 w-full"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-red-500">
                            Error fetching reservations: {error.message}
                        </TableCell>
                    </TableRow>
                ) : reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No reservations found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => (
                    <TableRow key={reservation._id}>
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
                        <div className="text-sm">
                          {format(new Date(reservation.createdAt), 'MMM dd, yyyy')}
                        </div>
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
