'use client';

import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

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
    }
  }, [socket]);

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border mt-8">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground">Live Status</h2>
      {!order ? (
        <p className="text-muted-foreground text-center py-8">Place an order to see its status.</p>
      ) : (
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-card-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                  item.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : item.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 