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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">QuickDine</h1>
        <p>123 Restaurant St, City, State</p>
      </div>
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Invoice #{order.id}</h2>
          <p>Table #{order.table_id}</p>
        </div>
        <div>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Quantity</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.item.name}</td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-right py-2">${item.item.price.toFixed(2)}</td>
              <td className="text-right py-2">
                ${(item.item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right">
        <h2 className="text-2xl font-bold">Total: ${order.total_price.toFixed(2)}</h2>
      </div>
      <div className="text-center mt-8">
        <p>Thank you for dining with us!</p>
      </div>
    </div>
  );
} 