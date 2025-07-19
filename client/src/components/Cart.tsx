'use client';

import React from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

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
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  tableId: string;
}

export default function Cart({ cart, socket, tableId }: CartProps) {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (socket && cart.length > 0) {
      socket.emit('placeOrder', { cart, tableId });
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground">Your Order</h2>
      {cart.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-card-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-card-foreground">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="border-t border-muted pt-4 mt-6 flex justify-between items-center">
            <p className="text-lg font-bold text-card-foreground">Total</p>
            <p className="text-xl font-bold text-primary">₹{total.toFixed(2)}</p>
          </div>
        </div>
      )}
      <button
        onClick={handlePlaceOrder}
        disabled={cart.length === 0}
        className="w-full bg-primary text-primary-foreground mt-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Place Order
      </button>
    </div>
  );
} 