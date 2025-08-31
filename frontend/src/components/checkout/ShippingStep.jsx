import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '../../contexts/CartContext';

const ShippingStep = ({ onNext, onBack }) => {
  const { total } = useCart();
  const shipping = total > 50 ? 0 : 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center p-4 border rounded-lg">
          <div>
            <p className="font-semibold">Standard Shipping</p>
            <p className="text-sm text-gray-500">5-7 business days</p>
          </div>
          <p className="font-semibold">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </p>
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onBack}>Back to Information</Button>
          <Button onClick={onNext}>Continue to Payment</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingStep;
