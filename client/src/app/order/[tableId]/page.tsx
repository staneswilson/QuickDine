'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Menu from '@/components/Menu';
import Cart from '@/components/Cart';
import OrderStatus from '@/components/OrderStatus';
import { ModeToggle } from '@/components/mode-toggle';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/menu`);
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
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
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
        prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const placeOrder = () => {
    if (socket && cart.length > 0) {
      socket.emit('placeOrder', { cart, tableId });
      // We can clear cart here, or wait for a confirmation event from server
    }
  };
  
  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <span className="text-primary">QuickDine</span> Menu
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="font-semibold">Table #{tableId}</span>
             <ModeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div className="lg:col-span-2 xl:col-span-3">
            <Menu menu={menu} addToCart={addToCart} />
          </div>

          {/* Cart for larger screens */}
          <aside className="hidden lg:block lg:col-span-1 xl:col-span-1 space-y-8 sticky top-24 self-start">
            <Cart cart={cart} updateQuantity={updateQuantity} placeOrder={placeOrder} />
            <OrderStatus socket={socket} />
          </aside>

          {/* Cart as a Sheet for smaller screens */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="rounded-full shadow-lg">
                  <MenuIcon className="mr-2 h-5 w-5" />
                  View Order
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col">
                <div className="flex-grow overflow-y-auto">
                    <Cart cart={cart} updateQuantity={updateQuantity} placeOrder={placeOrder} />
                    <OrderStatus socket={socket} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </main>
    </div>
  );
} 