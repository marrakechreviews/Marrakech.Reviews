import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await ordersAPI.getOrder(id);
                if (response.data.success) {
                    setOrder(response.data.data);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch order details.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred while fetching order details.');
                toast.error(err.response?.data?.message || 'Failed to fetch order details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) return <div className="text-center p-8">Loading order details...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    if (!order) return <div className="text-center p-8">Order not found.</div>;

    return (
        <>
            <Helmet>
                <title>Order Details - Marrakech Experiences</title>
            </Helmet>
            <div className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                        <Link to="/account?tab=orders">
                            <Button variant="outline">&larr; Back to My Orders</Button>
                        </Link>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order #{order._id.substring(0, 7)}</CardTitle>
                            <CardDescription>
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Shipping Address</h3>
                                    <p>{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Payment Information</h3>
                                    <p>Method: {order.paymentMethod}</p>
                                    <div>
                                        Status: <Badge variant={order.isPaid ? 'success' : 'secondary'}>{order.isPaid ? 'Paid' : 'Not Paid'}</Badge>
                                    </div>
                                    {order.paidAt && <p>Paid on: {new Date(order.paidAt).toLocaleDateString()}</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Order Items</h3>
                                <div className="space-y-4">
                                    {order.orderItems.map((item) => (
                                        <div key={item._id} className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                                            </div>
                                            <p className="font-medium">${(item.price * item.qty).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-right space-y-2">
                                <p>Subtotal: ${order.itemsPrice.toFixed(2)}</p>
                                <p>Shipping: ${order.shippingPrice.toFixed(2)}</p>
                                <p className="font-bold text-lg">Total: ${order.totalPrice.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default OrderDetailPage;
