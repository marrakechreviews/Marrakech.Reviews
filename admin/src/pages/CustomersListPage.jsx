import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

export default function CustomersListPage() {
  const [customers, setCustomers] = useState([]);
  const [reservationCustomers, setReservationCustomers] = useState([]);
  const [flightCustomers, setFlightCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch registered users
      const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/users`, { headers });
      const usersData = await usersRes.json();

      // Fetch activity reservation customers
      const reservationsRes = await fetch(`${import.meta.env.VITE_API_URL}/reservations`, { headers });
      const reservationsData = await reservationsRes.json();

      // Fetch flight reservation customers
      const flightsRes = await fetch(`${import.meta.env.VITE_API_URL}/flights`, { headers });
      const flightsData = await flightsRes.json();

      setCustomers(usersData.data || []);
      
      // Process reservation customers
      const reservationCustomerMap = new Map();
      (reservationsData.data || []).forEach(reservation => {
        const email = reservation.customerInfo.email;
        if (reservationCustomerMap.has(email)) {
          const existing = reservationCustomerMap.get(email);
          existing.totalSpent += reservation.totalPrice;
          existing.reservationCount += 1;
          existing.lastActivity = new Date(Math.max(
            new Date(existing.lastActivity),
            new Date(reservation.createdAt)
          ));
        } else {
          reservationCustomerMap.set(email, {
            name: reservation.customerInfo.name,
            email: reservation.customerInfo.email,
            phone: reservation.customerInfo.phone,
            whatsapp: reservation.customerInfo.whatsapp,
            totalSpent: reservation.totalPrice,
            reservationCount: 1,
            lastActivity: new Date(reservation.createdAt),
            type: 'activity'
          });
        }
      });

      // Process flight customers
      const flightCustomerMap = new Map();
      (flightsData.data || []).forEach(flight => {
        const email = flight.customerInfo.email;
        if (flightCustomerMap.has(email)) {
          const existing = flightCustomerMap.get(email);
          existing.totalSpent += flight.pricing.totalPrice;
          existing.reservationCount += 1;
          existing.lastActivity = new Date(Math.max(
            new Date(existing.lastActivity),
            new Date(flight.createdAt)
          ));
        } else {
          flightCustomerMap.set(email, {
            name: `${flight.customerInfo.firstName} ${flight.customerInfo.lastName}`,
            email: flight.customerInfo.email,
            phone: flight.customerInfo.phone,
            whatsapp: flight.customerInfo.whatsapp,
            totalSpent: flight.pricing.totalPrice,
            reservationCount: 1,
            lastActivity: new Date(flight.createdAt),
            type: 'flight'
          });
        }
      });

      setReservationCustomers(Array.from(reservationCustomerMap.values()));
      setFlightCustomers(Array.from(flightCustomerMap.values()));
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && customer.isActive) ||
                         (filterStatus === 'inactive' && !customer.isActive) ||
                         (filterStatus === 'admin' && customer.role === 'admin');
    return matchesSearch && matchesStatus;
  });

  const filteredReservationCustomers = reservationCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFlightCustomers = flightCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCustomers = (data, filename) => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Total Spent', 'Reservations', 'Last Activity'],
      ...data.map(customer => [
        customer.name,
        customer.email,
        customer.phone || customer.whatsapp || '',
        customer.totalSpent || 0,
        customer.reservationCount || 0,
        customer.lastActivity ? format(new Date(customer.lastActivity), 'yyyy-MM-dd') : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all your customers across different services.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Tabs */}
      <Tabs defaultValue="registered" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registered">Registered Users ({customers.length})</TabsTrigger>
          <TabsTrigger value="activities">Activity Customers ({reservationCustomers.length})</TabsTrigger>
          <TabsTrigger value="flights">Flight Customers ({flightCustomers.length})</TabsTrigger>
        </TabsList>

        {/* Registered Users Tab */}
        <TabsContent value="registered">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>Users who have created accounts on your platform</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => exportCustomers(filteredCustomers, 'registered-users.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'}>
                          {customer.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? 'default' : 'destructive'}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Customer Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about {customer.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Name</label>
                                  <p className="text-sm text-muted-foreground">{customer.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Phone</label>
                                  <p className="text-sm text-muted-foreground">{customer.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Role</label>
                                  <p className="text-sm text-muted-foreground">{customer.role}</p>
                                </div>
                              </div>
                              {customer.address && (
                                <div>
                                  <label className="text-sm font-medium">Address</label>
                                  <p className="text-sm text-muted-foreground">
                                    {[customer.address.street, customer.address.city, customer.address.country]
                                      .filter(Boolean).join(', ') || 'Not provided'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Customers Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Activity Customers</CardTitle>
                  <CardDescription>Customers who have booked activities</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => exportCustomers(filteredReservationCustomers, 'activity-customers.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone/WhatsApp</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Reservations</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservationCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || customer.whatsapp}</TableCell>
                      <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>{customer.reservationCount}</TableCell>
                      <TableCell>
                        {format(new Date(customer.lastActivity), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${customer.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                          {customer.whatsapp && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://wa.me/${customer.whatsapp}`} target="_blank" rel="noopener noreferrer">
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flight Customers Tab */}
        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Flight Customers</CardTitle>
                  <CardDescription>Customers who have booked flights</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => exportCustomers(filteredFlightCustomers, 'flight-customers.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone/WhatsApp</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Last Booking</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlightCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || customer.whatsapp}</TableCell>
                      <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>{customer.reservationCount}</TableCell>
                      <TableCell>
                        {format(new Date(customer.lastActivity), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${customer.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                          {customer.whatsapp && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://wa.me/${customer.whatsapp}`} target="_blank" rel="noopener noreferrer">
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

