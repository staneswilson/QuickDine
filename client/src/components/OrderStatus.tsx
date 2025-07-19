'use client';

import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { CheckCircle, Circle, Dot } from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  status: string;
}

interface NewOrderItem {
  id: number;
  item: { name: string };
  quantity: number;
  status: string;
}

interface Order {
  id: number;
  items: OrderItem[];
}

interface OrderStatusProps {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
}

export default function OrderStatus({ socket }: OrderStatusProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isBilled, setIsBilled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (socket) {
      socket.on('newOrder', (newOrder) => {
        const items = newOrder.items.map((item: NewOrderItem) => ({
          id: item.id,
          name: item.item.name,
          quantity: item.quantity,
          status: item.status,
        }));
        setOrder({ id: newOrder.id, items });
      });

      socket.on('orderItemStatusUpdated', ({ orderId, itemId, status }) => {
        setOrder((prevOrder) => {
          if (!prevOrder || prevOrder.id !== orderId) {
            return prevOrder;
          }

          return {
            ...prevOrder,
            items: prevOrder.items.map((item) =>
              item.id === itemId ? { ...item, status } : item
            ),
          };
        });
      });

      socket.on('tableStatusUpdated', ({ tableId, status }) => {
        // Assuming the customer is at a specific table, you'd check if it's their table.
        // For this example, we'll just listen for any 'billed' status.
        if (status === 'billed') {
          setIsBilled(true);
        }
      });
    }
  }, [socket]);

  const allItemsReady = order?.items.every(item => item.status === 'ready');

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border mt-8">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground">Live Order Status</h2>
      {!order ? (
        <p className="text-muted-foreground text-center py-8">Your order details will appear here.</p>
      ) : (
        <div className="space-y-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                {item.status === 'ready' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : item.status === 'in-progress' ? (
                  <Dot className="h-6 w-6 text-blue-500 animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-card-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold capitalize">
                {item.status.replace('-', ' ')}
              </span>
            </div>
          ))}
          
          {allItemsReady && !isBilled && (
            <div className="text-center text-green-600 font-semibold pt-4 border-t">
              Your order is ready for pickup!
            </div>
          )}

          {isBilled && (
            <div className="pt-6 border-t mt-6 text-center">
              <p className="text-lg font-semibold mb-4">Your invoice is ready.</p>
              <Button onClick={() => router.push(`/invoice/${order.id}`)}>
                View Invoice
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 