'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface OrderItem {
  item: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: number;
  table_id: number;
  total_price: number;
  items: OrderItem[];
}

export default function InvoicePage() {
  const [order, setOrder] = useState<Order | null>(null);
  const params = useParams();
  const orderId = params.orderId;

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/orders/${orderId}`
          );
          setOrder(response.data);
        } catch (error) {
          console.error('Failed to fetch order:', error);
        }
      };

      fetchOrder();
    }
  }, [orderId]);

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-secondary p-8 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-card p-12 rounded-lg shadow-md">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary">QuickDine</h1>
          <p className="text-muted-foreground">123 Restaurant St, City, State</p>
        </header>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">Invoice</h2>
            <p className="text-muted-foreground">Order #{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Table #{order.table_id}</p>
            <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 font-semibold text-muted-foreground">Item</th>
              <th className="text-center py-3 font-semibold text-muted-foreground">Quantity</th>
              <th className="text-right py-3 font-semibold text-muted-foreground">Price</th>
              <th className="text-right py-3 font-semibold text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="border-b last:border-b-0">
                <td className="py-4 text-card-foreground">{item.item.name}</td>
                <td className="text-center py-4 text-muted-foreground">{item.quantity}</td>
                <td className="text-right py-4 text-muted-foreground">₹{item.item.price.toFixed(2)}</td>
                <td className="text-right py-4 font-semibold text-card-foreground">
                  ₹{(item.item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-8">
          <div className="w-full max-w-xs">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-muted-foreground">Subtotal</span>
              <span className="text-muted-foreground">₹{order.total_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg mt-2">
              <span className="font-semibold text-muted-foreground">Tax (0%)</span>
              <span className="text-muted-foreground">₹0.00</span>
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between items-center text-2xl font-bold">
              <span className="text-primary">Total</span>
              <span className="text-primary">₹{order.total_price.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <footer className="text-center mt-12">
          <p className="text-muted-foreground">Thank you for dining with us!</p>
          <button
            onClick={() => window.print()}
            className="mt-6 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors print:hidden"
          >
            Print Invoice
          </button>
        </footer>
      </div>
    </div>
  );
} 