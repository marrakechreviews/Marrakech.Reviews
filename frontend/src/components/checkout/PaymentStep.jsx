import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import PayPalButton from './PayPalButton';

const PaymentStep = ({ onBack, orderData, onPaymentSuccess, onPaymentError, validateForm }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="stripe" id="stripe" />
            <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" />
              Credit/Debit Card
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="cursor-pointer">Cash on Delivery</Label>
          </div>
        </RadioGroup>

        {paymentMethod === 'paypal' && (
          <div className="mt-4">
            <PayPalButton
              orderData={orderData}
              onPaymentSuccess={onPaymentSuccess}
              onPaymentError={onPaymentError}
              disabled={!validateForm()}
            />
          </div>
        )}

        {/* Stripe form would go here */}

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onBack}>Back to Shipping</Button>
          {paymentMethod !== 'paypal' && <Button>Pay Now</Button>}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;
