import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesAPI } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function FreeReservations() {
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', { status: 'pending manual confirmation' }],
    queryFn: () => activitiesAPI.getReservations({ status: 'pending manual confirmation' }),
    select: (response) => response.data.reservations,
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => activitiesAPI.confirmReservation(id),
    onSuccess: () => {
      toast.success('Reservation confirmed');
      queryClient.invalidateQueries(['reservations']);
    },
    onError: () => {
      toast.error('Failed to confirm reservation');
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Free Reservations Pending Confirmation</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Persons</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations && reservations.map((reservation) => (
              <TableRow key={reservation._id}>
                <TableCell>{reservation.activity.name}</TableCell>
                <TableCell>{reservation.customerInfo.name}</TableCell>
                <TableCell>{format(new Date(reservation.reservationDate), 'PPP')}</TableCell>
                <TableCell>{reservation.numberOfPersons}</TableCell>
                <TableCell>
                  <Badge variant={reservation.status === 'pending manual confirmation' ? 'destructive' : 'secondary'}>
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => confirmMutation.mutate(reservation._id)}
                    disabled={confirmMutation.isLoading}
                  >
                    Confirm
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
