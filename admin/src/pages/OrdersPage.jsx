import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Edit, 
  Download, 
  Plus,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { ordersAPI, usersAPI, productsAPI } from '../lib/api';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: '',
    trackingNumber: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch orders
  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ['orders', searchTerm, statusFilter, paymentFilter, sortBy],
    queryFn: () => ordersAPI.getOrders({ 
      search: searchTerm,
      status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      isPaid: paymentFilter === 'paid' ? true : paymentFilter === 'unpaid' ? false : undefined,
      sort: sortBy,
      limit: 50
    }),
  });

  // Fetch order stats
  const { data: statsResponse } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => ordersAPI.getOrderStats(),
  });

  const orders = ordersResponse?.data?.data || [];
  const totalOrders = ordersResponse?.data?.pagination?.total || 0;
  const stats = statsResponse?.data || {};

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => ordersAPI.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order-stats']);
      setIsEditDialogOpen(false);
      toast.success('Order updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update order');
    },
  });

  // Mark as delivered mutation
  const deliverMutation = useMutation({
    mutationFn: (id) => ordersAPI.markAsDelivered(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order-stats']);
      toast.success('Order marked as delivered');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark as delivered');
    },
  });

  const reminderMutation = useMutation({
    mutationFn: (id) => ordersAPI.sendPaymentReminder(id),
    onSuccess: () => {
      toast.success('Payment reminder sent');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    },
  });

  const handleSendReminder = useCallback((orderId) => {
    if (window.confirm('Send a payment reminder to the customer?')) {
      reminderMutation.mutate(orderId);
    }
  }, [reminderMutation]);

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  }, []);

  const handleEditOrder = useCallback((order) => {
    setSelectedOrder(order);
    setEditFormData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || ''
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateOrder = useCallback(() => {
    updateStatusMutation.mutate({
      id: selectedOrder._id,
      data: editFormData
    });
  }, [selectedOrder, editFormData, updateStatusMutation]);

  const handleMarkDelivered = useCallback((orderId) => {
    if (window.confirm('Mark this order as delivered?')) {
      deliverMutation.mutate(orderId);
    }
  }, [deliverMutation]);

  const handleExportOrders = useCallback(() => {
    // Create CSV content
    const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Payment', 'Date'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.orderNumber || order._id,
        order.user?.name || 'N/A',
        order.user?.email || 'N/A',
        order.totalPrice,
        order.status,
        order.isPaid ? 'Paid' : 'Unpaid',
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  }, [orders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock },
      processing: { variant: 'default', icon: Package },
      shipped: { variant: 'default', icon: Truck },
      delivered: { variant: 'default', icon: CheckCircle },
      cancelled: { variant: 'destructive', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const OrderDetailDialog = () => (
    <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {selectedOrder?.orderNumber || selectedOrder?._id}</DialogTitle>
        </DialogHeader>
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-lg font-semibold mt-1">{formatPrice(selectedOrder.totalPrice)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Payment</div>
                  <div className="mt-1">
                    <Badge variant={selectedOrder.isPaid ? 'default' : 'secondary'}>
                      {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="text-sm mt-1">{formatDate(selectedOrder.createdAt)}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="items" className="w-full">
              <TabsList>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <div className="font-medium">{item.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatPrice(item.price)}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{formatPrice(item.price * item.qty)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2 max-w-sm ml-auto">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>{formatPrice(selectedOrder.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(selectedOrder.taxPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatPrice(selectedOrder.shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label>Name</Label>
                      <div className="font-medium">{selectedOrder.user?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="font-medium">{selectedOrder.user?.email || 'N/A'}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label>Full Name</Label>
                      <div className="font-medium">{selectedOrder.shippingAddress.fullName}</div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <div className="font-medium">
                        {selectedOrder.shippingAddress.address}<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                        {selectedOrder.shippingAddress.country}
                      </div>
                    </div>
                    {selectedOrder.shippingAddress.phone && (
                      <div>
                        <Label>Phone</Label>
                        <div className="font-medium">{selectedOrder.shippingAddress.phone}</div>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div>
                        <Label>Tracking Number</Label>
                        <div className="font-medium">{selectedOrder.trackingNumber}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label>Payment Method</Label>
                      <div className="font-medium">{selectedOrder.paymentMethod}</div>
                    </div>
                    <div>
                      <Label>Payment Status</Label>
                      <div>
                        <Badge variant={selectedOrder.isPaid ? 'default' : 'secondary'}>
                          {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    </div>
                    {selectedOrder.isPaid && selectedOrder.paidAt && (
                      <div>
                        <Label>Paid At</Label>
                        <div className="font-medium">{formatDate(selectedOrder.paidAt)}</div>
                      </div>
                    )}
                    {selectedOrder.paymentResult && (
                      <div>
                        <Label>Payment ID</Label>
                        <div className="font-medium">{selectedOrder.paymentResult.id}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const OrderEditDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order-status">Status</Label>
            <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking-number">Tracking Number</Label>
            <Input
              id="tracking-number"
              value={editFormData.trackingNumber}
              onChange={(e) => setEditFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
              placeholder="Enter tracking number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-notes">Notes</Label>
            <Textarea
              id="order-notes"
              value={editFormData.notes}
              onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this order"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder} disabled={updateStatusMutation.isPending}>
              Update Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportOrders}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.averageOrderValue || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Newest First</SelectItem>
            <SelectItem value="createdAt">Oldest First</SelectItem>
            <SelectItem value="-totalPrice">Highest Value</SelectItem>
            <SelectItem value="totalPrice">Lowest Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.orderNumber || order._id.slice(-8).toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.user?.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatPrice(order.totalPrice)}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.isPaid ? 'default' : 'secondary'}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(order.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {order.status === 'shipped' && !order.isDelivered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkDelivered(order._id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {!order.isPaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReminder(order._id)}
                          className="text-blue-600 hover:text-blue-700"
                          disabled={reminderMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
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

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      )}

      {/* Dialogs */}
      <OrderDetailDialog />
      <OrderEditDialog />
    </div>
  );
};

export default OrdersPage;

