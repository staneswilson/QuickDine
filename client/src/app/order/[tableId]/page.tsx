'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Menu from '../../../components/Menu';
import Cart from '../../../components/Cart';
import OrderStatus from '../../../components/OrderStatus';

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface PageProps {
  params: {
    tableId: string;
  };
}

export default function OrderPage({ params }: PageProps) {
  const { tableId } = params;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('joinTable', tableId);
    });

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Table {tableId}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Menu Section */}
        <div className="md:col-span-2">
          <Menu addToCart={addToCart} />
        </div>

        {/* Cart and Order Status Section */}
        <div>
          <Cart cart={cart} socket={socket} tableId={tableId} />
          <OrderStatus socket={socket} />
        </div>
      </div>
    </div>
  );
} 