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
import { toast } from 'sonner';
import { activitiesAPI, organizedTravelAPI } from '@/lib/api';

export default function ReservationsManagementPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const promises = [];
      const params = {
        search: searchTerm,
        status: filterStatus === 'all' ? '' : filterStatus,
      };

      if (filterType === 'all' || filterType === 'activity') {
        promises.push(activitiesAPI.getReservations(params).then(res => res.data.reservations.map(r => ({ ...r, type: 'Activity' }))));
      }
      if (filterType === 'all' || filterType === 'travel') {
        promises.push(organizedTravelAPI.getReservations(params).then(res => res.data.reservations.map(r => ({ ...r, type: 'Organized Travel' }))));
      }

      const results = await Promise.all(promises);
      const combinedReservations = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReservations(combinedReservations);

    } catch (error) {
      toast.error('Failed to fetch reservations.');
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [searchTerm, filterStatus, filterType]);

  const handleStatusChange = async (reservation, newStatus, adminNotes = '') => {
    try {
      if (reservation.type === 'Activity') {
        await activitiesAPI.updateReservationStatus(reservation._id, { status: newStatus, adminNotes });
      } else {
        await organizedTravelAPI.updateReservationStatus(reservation._id, { status: newStatus, notes: adminNotes });
      }
      toast.success('Reservation status updated.');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'completed':
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Reservations</h1>
          <p className="text-muted-foreground">Manage all bookings for activities and travel</p>
        </div>
        <Button variant="outline" onClick={fetchReservations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Activity">Activity</SelectItem>
                <SelectItem value="Organized Travel">Organized Travel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
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
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations ({reservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
              ) : reservations.map((reservation) => (
                <TableRow key={reservation._id}>
                  <TableCell><Badge variant="outline">{reservation.type}</Badge></TableCell>
                  <TableCell>
                    {reservation.type === 'Activity' ? reservation.customerInfo.name : `${reservation.firstName} ${reservation.lastName}`}
                    <br />
                    <span className="text-muted-foreground text-sm">
                      {reservation.type === 'Activity' ? reservation.customerInfo.email : reservation.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    {reservation.type === 'Activity' ? reservation.activity?.name : reservation.programId?.title}
                  </TableCell>
                  <TableCell>
                    {format(new Date(reservation.type === 'Activity' ? reservation.reservationDate : reservation.preferredDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {reservation.type === 'Activity' ? reservation.numberOfPersons : reservation.numberOfTravelers}
                  </TableCell>
                  <TableCell>${reservation.totalPrice}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
