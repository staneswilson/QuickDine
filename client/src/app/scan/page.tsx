'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

export default function ScanPage() {
  const [tableNumber, setTableNumber] = useState('');
  const router = useRouter();

  const handleProceed = () => {
    if (tableNumber.trim()) {
      router.push(`/order/${tableNumber}`);
    } else {
      alert('Please enter a table number.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Enter Your Table Number</CardTitle>
          <CardDescription>
            Please enter the number displayed on your table to view the menu and place your order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g., 5"
                type="number"
                className="text-center text-lg"
              />
            </div>
            <Button onClick={handleProceed} className="w-full">
              Go to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 