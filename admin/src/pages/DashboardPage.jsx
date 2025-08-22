import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
} from 'lucide-react';
import { usersAPI, productsAPI, ordersAPI } from '../lib/api';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => usersAPI.getUserStats().then(res => res.data.data),
  });

  const { data: orderStats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => ordersAPI.getOrderStats().then(res => res.data.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => productsAPI.getTopProducts(5).then(res => res.data.data),
  });

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${orderStats?.overview?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: orderStats?.overview?.totalOrders?.toLocaleString() || '0',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      title: 'Total Users',
      value: userStats?.overview?.totalUsers?.toLocaleString() || '0',
      change: '+15.3%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Active Products',
      value: '0', // We'll need to add this to the API
      change: '+3.1%',
      changeType: 'positive',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with Marrakech Reviews.
        </p>
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
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderStats?.recent?.map((order) => (
                <div key={order._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${order.totalPrice}
                    </p>
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'default'
                          : order.status === 'shipped'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent orders
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Eye className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best performing products by rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts?.map((product, index) => (
                <div key={product._id} className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>⭐ {product.rating}</span>
                      <span>•</span>
                      <span>{product.numReviews} reviews</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${product.price}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.countInStock} in stock
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No products found
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Eye className="h-4 w-4 mr-2" />
              View All Products
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Distribution */}
      {orderStats?.byStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of orders by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {orderStats.byStatus.map((status) => (
                <div key={status._id} className="text-center">
                  <div className="text-2xl font-bold">{status.count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status._id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${status.totalValue?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

