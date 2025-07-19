'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import axios from 'axios';
import { useAuth } from '@/auth/useAuth';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kitchen Display System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Table {order.table_id}</h2>
            <ul>
              {order.items.map((item) => (
                <li key={item.id} className="mb-2 p-2 border rounded-md">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-semibold">{item.item.name}</span> (x{item.quantity})
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.status}</span>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => handleUpdateStatus(order.id, item.id, 'in-progress')}
                      className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2 text-sm"
                      disabled={item.status === 'in-progress' || item.status === 'ready'}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, item.id, 'ready')}
                      className="bg-green-500 text-white px-2 py-1 rounded-md text-sm"
                      disabled={item.status === 'ready'}
                    >
                      Ready
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 