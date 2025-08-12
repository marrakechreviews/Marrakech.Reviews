import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  MapPin,
  Calendar,
  Activity,
  Plane,
  BarChart3,
  PieChart,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { format } from 'date-fns';

export default function EnhancedDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [visitData, setVisitData] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json'
      };

      const [dashboardRes, visitRes, reservationRes, customerRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard?period=${selectedPeriod}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/analytics/visits?period=${selectedPeriod}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/analytics/reservations`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/analytics/customers`, { headers })
      ]);

      const [dashboard, visits, reservations, customers] = await Promise.all([
        dashboardRes.ok ? dashboardRes.json() : { data: { overview: { totalRevenue: 0, totalVisits: 0, totalUsers: 0, totalReservations: 0, totalOrders: 0 } } },
        visitRes.ok ? visitRes.json() : { data: { overview: { totalVisits: 0, uniqueVisitors: 0 } } },
        reservationRes.ok ? reservationRes.json() : { data: { activities: { overview: { totalReservations: 0, totalRevenue: 0 } } } },
        customerRes.ok ? customerRes.json() : { data: { userTrends: [], topCustomers: [] } }
      ]);

      setDashboardData(dashboard.data);
      setVisitData(visits.data);
      setReservationData(reservations.data);
      setCustomerData(customers.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${dashboardData?.overview?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Total Visits',
      value: dashboardData?.visitStats?.totalVisits?.toLocaleString() || '0',
      change: `${visitData?.overview?.bounceRate || 0}% bounce rate`,
      changeType: 'neutral',
      icon: Eye,
    },
    {
      title: 'Total Users',
      value: dashboardData?.userStats?.totalUsers?.toLocaleString() || '0',
      change: `${dashboardData?.userStats?.activeUsers || 0} active`,
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Total Reservations',
      value: dashboardData?.overview?.totalReservations?.toLocaleString() || '0',
      change: `${dashboardData?.activityReservationStats?.pendingReservations || 0} pending`,
      changeType: 'neutral',
      icon: Calendar,
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analytics and insights for your business.
          </p>
        </div>
        <div className="flex gap-2">
          {['7', '30', '90'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period} days
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : stat.changeType === 'negative' ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                )}
                <span className={
                  stat.changeType === 'positive' ? 'text-green-500' : 
                  stat.changeType === 'negative' ? 'text-red-500' : 
                  'text-blue-500'
                }>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visits & Traffic</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Visit Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Visit Trends</CardTitle>
                <CardDescription>Daily visits over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={visitData?.dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    />
                    <Line type="monotone" dataKey="visits" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="uniqueVisitors" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Activities</span>
                    </div>
                    <span className="font-medium">
                      ${dashboardData?.activityReservationStats?.totalRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Plane className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Flights</span>
                    </div>
                    <span className="font-medium">
                      ${dashboardData?.flightStats?.totalFlightRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Products</span>
                    </div>
                    <span className="font-medium">
                      ${dashboardData?.orderStats?.totalOrderRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentActivity?.reservations?.map((reservation) => (
                    <div key={reservation._id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{reservation.reservationId}</p>
                        <p className="text-xs text-muted-foreground">{reservation.customerInfo.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${reservation.totalPrice}</p>
                        <Badge variant="outline" className="text-xs">
                          {reservation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Flight Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Flight Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentActivity?.flightReservations?.map((reservation) => (
                    <div key={reservation._id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{reservation.bookingReference}</p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.customerInfo.firstName} {reservation.customerInfo.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${reservation.pricing.totalPrice}</p>
                        <Badge variant="outline" className="text-xs">
                          {reservation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentActivity?.orders?.map((order) => (
                    <div key={order._id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${order.totalPrice}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={visitData?.trafficSources || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visits"
                    >
                      {(visitData?.trafficSources || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visitData?.topPages?.slice(0, 8).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{page.url}</p>
                        <p className="text-xs text-muted-foreground">
                          {page.uniqueVisitors} unique visitors
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{page.views} views</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(page.averageTimeSpent)}s avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Unique Visitors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitData?.geographicStats?.slice(0, 10).map((location, index) => (
                    <TableRow key={index}>
                      <TableCell>{location.country}</TableCell>
                      <TableCell>{location.city}</TableCell>
                      <TableCell>{location.visits}</TableCell>
                      <TableCell>{location.uniqueVisitors}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Activity Reservations Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reservationData?.activities?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Popular Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reservationData?.activities?.popularActivities?.slice(0, 8).map((activity, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{activity.activityName}</p>
                        <p className="text-xs text-muted-foreground">{activity.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{activity.reservationCount} bookings</p>
                        <p className="text-xs text-muted-foreground">
                          ${Math.round(activity.averageReservationValue)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Reservations by Supplier */}
          <Card>
            <CardHeader>
              <CardTitle>Flight Reservations by Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Reservations</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservationData?.flights?.bySupplier?.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">{supplier._id}</TableCell>
                      <TableCell>{supplier.count}</TableCell>
                      <TableCell>${supplier.revenue?.toLocaleString()}</TableCell>
                      <TableCell>${supplier.commission?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Registration Trends */}
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={customerData?.userTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={customerData?.customerSegments || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(customerData?.customerSegments || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Reservations</TableHead>
                    <TableHead>Last Reservation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData?.topCustomers?.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer.customerName}</TableCell>
                      <TableCell>{customer._id}</TableCell>
                      <TableCell>${customer.totalSpent?.toLocaleString()}</TableCell>
                      <TableCell>{customer.reservationCount}</TableCell>
                      <TableCell>
                        {format(new Date(customer.lastReservation), 'MMM dd, yyyy')}
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

