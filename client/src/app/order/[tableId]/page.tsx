'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Menu from '@/components/Menu';
import Cart from '@/components/Cart';
import OrderStatus from '@/components/OrderStatus';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  is_veg: boolean;
  image_url: string | null;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function OrderPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!tableId) return; // Don't connect until tableId is available
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [tableId]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-left mb-16">
          <p className="text-xl text-muted-foreground">
            Welcome, you are ordering for
          </p>
          <h1 className="text-6xl font-bold tracking-tight text-primary">
            Table {tableId}
          </h1>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <Menu addToCart={addToCart} />
          </div>

          <aside className="relative">
            <div className="sticky top-16">
              <Cart cart={cart} socket={socket} tableId={tableId} />
              <OrderStatus socket={socket} />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
} 