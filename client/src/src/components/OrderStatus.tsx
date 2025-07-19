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
    <div>
      <h2 className="text-xl font-semibold mb-2">Order Status</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        {!order ? (
          <p>You haven&apos;t placed an order yet.</p>
        ) : (
          <ul>
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span className="font-medium">{item.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 