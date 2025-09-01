import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const UserReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const response = await api.get('/reservations/myreservations');
                if (response.data.success) {
                    setReservations(response.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch reservations.');
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    if (loading) return <div>Loading reservations...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reservations</CardTitle>
            </CardHeader>
            <CardContent>
                {reservations.length === 0 ? (
                    <p>You have no reservations.</p>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((reservation) => (
                            <div key={reservation._id} className="border p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{reservation.activity?.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Date: {new Date(reservation.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Guests: {reservation.participants}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${reservation.totalPrice.toFixed(2)}</p>
                                    <Badge variant={reservation.status === 'confirmed' ? 'success' : 'secondary'}>
                                        {reservation.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UserReservations;
