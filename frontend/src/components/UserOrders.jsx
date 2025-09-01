import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get('/orders/myorders');
                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <p>You have no orders.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="border p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">Order #{order._id.substring(0, 7)}</h3>
                                        <p className="text-sm text-gray-500">
                                            Date: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${order.totalPrice.toFixed(2)}</p>
                                        <Badge variant={order.isPaid ? 'success' : 'secondary'}>
                                            {order.isPaid ? 'Paid' : 'Not Paid'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-medium text-sm">Items:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {order.orderItems.map(item => (
                                            <li key={item._id}>{item.name} (x{item.qty})</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={async () => {
                                        try {
                                            const response = await api.get(`/orders/${order._id}/invoice`, {
                                                responseType: 'blob',
                                            });
                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', `invoice-${order._id}.pdf`);
                                            document.body.appendChild(link);
                                            link.click();
                                        } catch (error) {
                                            console.error('Failed to download invoice', error);
                                        }
                                    }}>Download Invoice</Button>
                                    <Link to={`/orders/${order._id}`}>
                                        <Button variant="outline" size="sm">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UserOrders;
