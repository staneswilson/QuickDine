'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import axios from 'axios';
import { useAuth } from '../../../src/auth/useAuth';

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
    <div className="min-h-screen bg-secondary p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-primary">Kitchen Display System</h1>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {orders.map((order) => (
          <div key={order.id} className="bg-card rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-card-foreground">
                Table {order.table_id}
              </h2>
              <span className="text-lg font-semibold text-muted-foreground">
                Order #{order.id}
              </span>
            </div>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-card-foreground">{item.item.name}</p>
                      <p className="text-muted-foreground">Quantity: {item.quantity}</p>
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
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(order.id, item.id, 'in-progress')}
                      disabled={item.status === 'in-progress' || item.status === 'ready'}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, item.id, 'ready')}
                      disabled={item.status === 'ready'}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      Ready
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
} 