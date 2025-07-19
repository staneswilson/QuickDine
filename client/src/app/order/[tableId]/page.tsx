'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Menu from '@/components/Menu';
import Cart from '@/components/Cart';
import OrderStatus from '@/components/OrderStatus';
import axios from 'axios';

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
  const tableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/menu');
        setMenu(response.data);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      }
    };

    fetchMenu();

    return () => {
      newSocket.disconnect();
    };
  }, []);

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

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const placeOrder = () => {
    if (socket && cart.length > 0) {
      socket.emit('placeOrder', { cart, tableId });
      // Optionally clear the cart after placing the order
      // setCart([]); 
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
        <h1 className="text-3xl font-bold text-center">
          Welcome to <span className="text-primary">QuickDine</span>
        </h1>
        <p className="text-muted-foreground text-center mt-1">Table #{params.tableId}</p>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Menu menu={menu} addToCart={addToCart} />
          </div>
          <div className="space-y-8">
            <Cart cart={cart} updateQuantity={updateQuantity} placeOrder={placeOrder} />
            <OrderStatus socket={socket} />
          </div>
        </div>
      </main>
    </div>
  );
} 