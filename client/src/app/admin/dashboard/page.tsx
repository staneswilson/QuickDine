'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../src/auth/useAuth';

interface Table {
  id: number;
  number: number;
  status: string;
}

interface Order {
  id: number;
  table_id: number;
  status: string;
  items: {
    item: {
      name: string;
    };
    quantity: number;
  }[];
  total_price: number;
}

export default function AdminDashboard() {
  useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tables'),
          axios.get('http://localhost:5000/api/orders/active'),
        ]);
        setTables(tablesRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const handleUpdateTableStatus = async (status: string) => {
    if (!selectedTable) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/tables/${selectedTable.id}`,
        { status }
      );
      setTables(
        tables.map((table) =>
          table.id === selectedTable.id ? response.data : table
        )
      );
      setSelectedTable(null);
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tables Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Tables</h2>
          <div className="grid grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-lg text-center font-bold cursor-pointer ${
                  table.status === 'free'
                    ? 'bg-green-200'
                    : table.status === 'occupied'
                    ? 'bg-yellow-200'
                    : 'bg-red-200'
                }`}
              >
                Table {table.number}
              </div>
            ))}
          </div>
        </div>

        {/* Active Orders Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Active Orders</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            {orders.length === 0 ? (
              <p>No active orders.</p>
            ) : (
              <ul>
                {orders.map((order) => (
                  <li
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer hover:bg-gray-200 p-1"
                  >
                    Order #{order.id} - Table {order.table_id}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Update Table {selectedTable.number} Status
            </h2>
            <div className="flex justify-around">
              <button
                onClick={() => handleUpdateTableStatus('free')}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Free
              </button>
              <button
                onClick={() => handleUpdateTableStatus('occupied')}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md"
              >
                Occupied
              </button>
              <button
                onClick={() => handleUpdateTableStatus('billed')}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Billed
              </button>
            </div>
            <button
              onClick={() => setSelectedTable(null)}
              className="mt-4 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">
              Order #{selectedOrder.id} - Table {selectedOrder.table_id}
            </h2>
            <ul>
              {selectedOrder.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.item.name} (x{item.quantity})</span>
                </li>
              ))}
            </ul>
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${selectedOrder.total_price.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => router.push(`/invoice/${selectedOrder.id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Generate Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-sm text-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 