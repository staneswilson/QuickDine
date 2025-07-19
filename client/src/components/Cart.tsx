'use client';

import React from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Button } from './ui/button';

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartProps {
  cart: CartItem[];
  updateQuantity: (itemId: number, quantity: number) => void;
  placeOrder: () => void;
}

export default function Cart({ cart, updateQuantity, placeOrder }: CartProps) {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground">Your Order</h2>
      {cart.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-card-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border rounded-md">-</button>
                  <span className="px-4">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border rounded-md">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-6 flex justify-between items-center">
            <p className="text-lg font-bold text-card-foreground">Total</p>
            <p className="text-xl font-bold text-primary">₹{total.toFixed(2)}</p>
          </div>
          <Button onClick={placeOrder} className="w-full mt-6" disabled={cart.length === 0}>
            Place Order
          </Button>
        </div>
      )}
    </div>
  );
} 