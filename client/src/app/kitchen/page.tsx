'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import axios from 'axios';
import { useAuth } from '../../../src/auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id: number;
  quantity: number;
  note: string | null;
  status: string;
  item: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  table_id: number;
  items: OrderItem[];
}

export default function KitchenPage() {
  useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const handleUpdateStatus = (orderId: number, itemId: number, status: string) => {
    if (socket) {
      socket.emit('updateOrderItemStatus', { orderId, itemId, status });
    }
  };

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    const fetchActiveOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders/active');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch active orders:', error);
      }
    };

    fetchActiveOrders();

    newSocket.on('newOrder', (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    newSocket.on('orderItemStatusUpdated', ({ orderId, itemId, status }) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.id === itemId ? { ...item, status } : item
                ),
              }
            : order
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Kitchen Display</h1>
            {/* You could add a filter or other controls here */}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Table {order.table_id}</CardTitle>
                <Badge>Order #{order.id}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{item.item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <Badge variant={
                        item.status === 'pending' ? 'default' :
                        item.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleUpdateStatus(order.id, item.id, 'in-progress')}
                        disabled={item.status === 'in-progress' || item.status === 'ready'}
                        size="sm"
                      >
                        In Progress
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(order.id, item.id, 'ready')}
                        disabled={item.status === 'ready'}
                        size="sm"
                        variant="secondary"
                      >
                        Ready
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
} 