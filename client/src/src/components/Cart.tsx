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
    if (socket) {
      socket.emit('placeOrder', { cart, tableId });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your Order</h2>
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div>
            <ul>
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (x{item.quantity})
                    </span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-green-500 text-white mt-4 py-2 rounded-md"
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 