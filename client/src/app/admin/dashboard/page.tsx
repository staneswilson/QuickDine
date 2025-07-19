'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/useAuth';
import io from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';

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
    const socket = io('http://localhost:5000');

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

    socket.on('tableStatusUpdated', (updatedTable: Table) => {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === updatedTable.id ? updatedTable : table
        )
      );
    });

    socket.on('newOrder', (newOrder: Order) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    return () => {
      socket.disconnect();
    };
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

  const handleCreateTable = async () => {
    // This is a placeholder. You will need to implement the API endpoint for this.
    const newTableNumber = tables.length + 1;
    try {
      const response = await axios.post('http://localhost:5000/api/tables', { number: newTableNumber });
      setTables([...tables, response.data]);
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <Button onClick={() => router.push('/admin/menu')}>
          Manage Menu
        </Button>
      </header>
      <main className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Table Status</CardTitle>
              <CardDescription>
                Monitor and manage table availability.
              </CardDescription>
            </div>
            <Button onClick={handleCreateTable} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Table
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 rounded-lg text-center font-bold cursor-pointer transition-all hover:shadow-lg ${
                    table.status === 'free'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : table.status === 'occupied'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  <p className="text-xl">{table.number}</p>
                  <p className="capitalize mt-1 text-sm">{table.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Active Orders</CardTitle>
            <CardDescription>
              View and manage current customer orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active orders.</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-secondary flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-card-foreground">
                        Order #{order.id} - Table {order.table_id}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                    <p className="font-bold text-primary">₹{order.total_price.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* MODALS */}
      <Dialog open={!!selectedTable} onOpenChange={(isOpen) => !isOpen && setSelectedTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Table {selectedTable?.number} Status</DialogTitle>
          </DialogHeader>
          <div className="flex justify-around space-x-4 py-4">
            <Button
              onClick={() => handleUpdateTableStatus('free')}
              variant={selectedTable?.status === 'free' ? 'default' : 'outline'}
              className="flex-1"
            >
              Free
            </Button>
            <Button
              onClick={() => handleUpdateTableStatus('occupied')}
              variant={selectedTable?.status === 'occupied' ? 'default' : 'outline'}
              className="flex-1"
            >
              Occupied
            </Button>
            <Button
              onClick={() => handleUpdateTableStatus('billed')}
              variant={selectedTable?.status === 'billed' ? 'destructive' : 'outline'}
              className="flex-1"
            >
              Billed
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id} - Table {selectedOrder?.table_id}</DialogTitle>
            <DialogDescription>
              Status: <span className="font-semibold capitalize">{selectedOrder?.status}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {selectedOrder?.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-foreground">{item.item.name}</span>
                <span className="text-muted-foreground">x{item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-primary">₹{selectedOrder?.total_price.toFixed(2)}</span>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => router.push(`/invoice/${selectedOrder?.id}`)}
              className="w-full sm:w-auto"
            >
              Generate Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 