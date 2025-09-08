import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
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
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState([]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const promises = [];
      const params = {
        search: searchTerm,
        status: filterStatus === 'all' ? '' : filterStatus,
        paymentStatus: filterPaymentStatus === 'all' ? '' : filterPaymentStatus,
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
  }, [searchTerm, filterStatus, filterType, filterPaymentStatus]);

  const handleStatusChange = async (reservation, newStatus) => {
    try {
      const api = reservation.type === 'Activity' ? activitiesAPI : organizedTravelAPI;
      await api.updateReservation(reservation._id, { status: newStatus });
      toast.success('Reservation status updated.');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation status.');
    }
  };

  const handlePaymentStatusChange = async (reservation, newPaymentStatus) => {
    try {
      const api = reservation.type === 'Activity' ? activitiesAPI : organizedTravelAPI;
      await api.updateReservation(reservation._id, { paymentStatus: newPaymentStatus });
      toast.success('Payment status updated successfully.');
      fetchReservations(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update payment status.');
      console.error('Failed to update payment status:', error);
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (reservation) => {
    if (window.confirm(`Are you sure you want to delete this reservation?`)) {
      try {
        if (reservation.type === 'Activity') {
          await activitiesAPI.deleteReservation(reservation._id);
        } else {
          await organizedTravelAPI.deleteReservation(reservation._id);
        }
        toast.success('Reservation deleted successfully.');
        fetchReservations();
      } catch (error) {
        toast.error('Failed to delete reservation.');
        console.error('Failed to delete reservation:', error);
      }
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReservations(reservations.map((r) => r._id));
    } else {
      setSelectedReservations([]);
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedReservations((prev) => [...prev, id]);
    } else {
      setSelectedReservations((prev) => prev.filter((reservationId) => reservationId !== id));
    }
  };

  const handleExport = () => {
    organizedTravelAPI.exportTravelReservations({ ids: selectedReservations })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'travel-reservations.csv');
        document.body.appendChild(link);
        link.click();
        toast.success('Travel reservations exported successfully');
      })
      .catch(error => {
        toast.error('Failed to export travel reservations');
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Reservations</h1>
          <p className="text-muted-foreground">Manage all bookings for activities and travel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchReservations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { setSelectedReservation(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Reservation
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedReservations.length === reservations.length && reservations.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10}>Loading...</TableCell></TableRow>
              ) : reservations.map((reservation) => (
                <TableRow key={reservation._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedReservations.includes(reservation._id)}
                      onCheckedChange={(checked) => handleSelectOne(checked, reservation._id)}
                    />
                  </TableCell>
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
                  <TableCell>
                    <Select
                      value={reservation.paymentStatus}
                      onValueChange={(newPaymentStatus) => handlePaymentStatusChange(reservation, newPaymentStatus)}
                    >
                      <SelectTrigger className={getPaymentStatusColor(reservation.paymentStatus)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedReservation(reservation); setIsFormOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(reservation)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedReservation ? 'Edit Reservation' : 'Create Reservation'}</DialogTitle>
          </DialogHeader>
          <ReservationForm
            reservation={selectedReservation}
            onSave={() => {
              setIsFormOpen(false);
              fetchReservations();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ReservationForm = ({ reservation, onSave, onCancel }) => {
  const [formData, setFormData] = useState({});
  const [formType, setFormType] = useState('Activity');
  const [availableActivities, setAvailableActivities] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);

  useEffect(() => {
    // Fetch lists of activities and programs for the dropdowns
    const fetchPrerequisites = async () => {
      try {
        const [activitiesRes, programsRes] = await Promise.all([
          activitiesAPI.getActivities({ limit: 1000, isActive: true }),
          organizedTravelAPI.getPrograms({ limit: 1000, isActive: true })
        ]);
        setAvailableActivities(activitiesRes.data.activities);
        setAvailablePrograms(programsRes.data);
      } catch (error) {
        console.error("Failed to fetch prerequisites:", error);
        toast.error("Failed to load activities and programs for the form.");
      }
    };
    fetchPrerequisites();
  }, []);

  useEffect(() => {
    if (reservation) {
      setFormType(reservation.type);
      if (reservation.type === 'Activity') {
        setFormData({
          activity: reservation.activity?._id,
          customerInfo: reservation.customerInfo,
          reservationDate: format(new Date(reservation.reservationDate), 'yyyy-MM-dd'),
          numberOfPersons: reservation.numberOfPersons,
          totalPrice: reservation.totalPrice,
          status: reservation.status,
          paymentStatus: reservation.paymentStatus,
          notes: reservation.notes || '',
        });
      } else { // Organized Travel
        setFormData({
          programId: reservation.programId?._id,
          firstName: reservation.firstName,
          lastName: reservation.lastName,
          email: reservation.email,
          phone: reservation.phone,
          preferredDate: format(new Date(reservation.preferredDate), 'yyyy-MM-dd'),
          numberOfTravelers: reservation.numberOfTravelers,
          totalPrice: reservation.totalPrice,
          status: reservation.status,
          paymentStatus: reservation.paymentStatus,
          notes: reservation.notes || '',
        });
      }
    } else {
      // Reset for new reservation
      setFormType('Activity');
      setFormData({
        // Default fields for Activity
      });
    }
  }, [reservation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (reservation) { // Update
        if (formType === 'Activity') {
          await activitiesAPI.updateReservation(reservation._id, formData);
        } else {
          await organizedTravelAPI.updateReservation(reservation._id, formData);
        }
        toast.success("Reservation updated successfully.");
      } else { // Create
        if (formType === 'Activity') {
          await activitiesAPI.createReservation(formData);
        } else {
          await organizedTravelAPI.createReservation(formData);
        }
        toast.success("Reservation created successfully.");
      }
      onSave();
    } catch (error) {
      toast.error("Failed to save reservation.");
      console.error("Failed to save reservation:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
      {!reservation && (
        <Select value={formType} onValueChange={setFormType}>
          <SelectTrigger>
            <SelectValue placeholder="Select reservation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Activity">Activity</SelectItem>
            <SelectItem value="Organized Travel">Organized Travel</SelectItem>
          </SelectContent>
        </Select>
      )}

      {formType === 'Activity' ? (
        <>
          <Label>Activity</Label>
          <Select name="activity" value={formData.activity} onValueChange={(value) => setFormData(prev => ({ ...prev, activity: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{availableActivities.map(a => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
          <Label>Customer Name</Label>
          <Input name="name" value={formData.customerInfo?.name || ''} onChange={handleCustomerInfoChange} />
          <Label>Customer Email</Label>
          <Input name="email" type="email" value={formData.customerInfo?.email || ''} onChange={handleCustomerInfoChange} />
          <Label>Customer WhatsApp</Label>
          <Input name="whatsapp" value={formData.customerInfo?.whatsapp || ''} onChange={handleCustomerInfoChange} />
          <Label>Reservation Date</Label>
          <Input name="reservationDate" type="date" value={formData.reservationDate} onChange={handleInputChange} />
          <Label>Number of Persons</Label>
          <Input name="numberOfPersons" type="number" value={formData.numberOfPersons} onChange={handleInputChange} />
        </>
      ) : ( // Organized Travel
        <>
          <Label>Travel Program</Label>
          <Select name="programId" value={formData.programId} onValueChange={(value) => setFormData(prev => ({ ...prev, programId: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{availablePrograms.map(p => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}</SelectContent>
          </Select>
          <Label>First Name</Label>
          <Input name="firstName" value={formData.firstName || ''} onChange={handleInputChange} />
          <Label>Last Name</Label>
          <Input name="lastName" value={formData.lastName || ''} onChange={handleInputChange} />
          <Label>Email</Label>
          <Input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
          <Label>Phone</Label>
          <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} />
          <Label>Preferred Date</Label>
          <Input name="preferredDate" type="date" value={formData.preferredDate} onChange={handleInputChange} />
          <Label>Number of Travelers</Label>
          <Input name="numberOfTravelers" type="number" value={formData.numberOfTravelers} onChange={handleInputChange} />
        </>
      )}

      <Label>Total Price</Label>
      <Input name="totalPrice" type="number" value={formData.totalPrice} onChange={handleInputChange} />
      <Label>Status</Label>
      <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Label>Payment Status</Label>
      <Select name="paymentStatus" value={formData.paymentStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value }))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
        </SelectContent>
      </Select>
      <Label>Admin Notes</Label>
      <Textarea name="notes" value={formData.notes} onChange={handleInputChange} />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{reservation ? 'Update Reservation' : 'Create Reservation'}</Button>
      </div>
    </form>
  );
};
