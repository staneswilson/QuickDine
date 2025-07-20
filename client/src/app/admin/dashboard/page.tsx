'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/useAuth';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Utensils, Zap, CreditCard, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';

interface Table {
  id: number;
  number: number;
  status: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  note: string | null;
  status: string;
  item: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  table_id: number;
  status: string;
  items: OrderItem[];
  total_price: number;
}

interface RevenueData {
  totalRevenue: number;
  percentageChange: number;
}

export default function AdminDashboard() {
  useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    setSocket(newSocket);

    const fetchData = async () => {
      try {
        const [tablesRes, ordersRes, revenueRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tables`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/active`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics/revenue`, getAuthHeaders())
        ]);
        setTables(tablesRes.data);
        setOrders(ordersRes.data);
        setRevenue(revenueRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();

    newSocket.on('tableStatusUpdated', (updatedTable: Table) => {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === updatedTable.id ? updatedTable : table
        )
      );
    });

    newSocket.on('newOrder', (newOrder: Order) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    newSocket.on('orderDeleted', (deletedOrderId) => {
      setOrders((prevOrders) => prevOrders.filter(order => order.id !== deletedOrderId));
    });

    newSocket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      // Refetch revenue data when an order status changes
      fetchData();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleUpdateTableStatus = async (status: string) => {
    if (!selectedTable) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${selectedTable.id}`,
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/tables`, { number: newTableNumber });
      setTables([...tables, response.data]);
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  const handleUpdateOrderStatus = async (status: string) => {
    if (!selectedOrder) return;
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedOrder.id}/status`, { status });
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedOrder.id}`);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" onClick={() => router.push('/admin/users')}>
                Manage Users
              </Button>
              <Button onClick={() => router.push('/admin/menu')}>
                Manage Menu
              </Button>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{revenue?.totalRevenue.toFixed(2) ?? '...'}</div>
              <p className="text-xs text-muted-foreground">+{revenue?.percentageChange ?? '...'}% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied Tables</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupiedTables} / {tables.length}</div>
              <p className="text-xs text-muted-foreground">Currently serving</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{orders.length}</div>
              <p className="text-xs text-muted-foreground">Pending and in-progress</p>
            </CardContent>
          </Card>
        </div>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-gradient-to-br from-card to-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-x-2">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">Table Status</CardTitle>
                <CardDescription>
                  Click a table to update its status.
                </CardDescription>
              </div>
              <Button onClick={handleCreateTable} size="sm" className="flex-shrink-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Table
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 rounded-lg text-center font-bold cursor-pointer transition-all hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center aspect-square ${
                      table.status === 'free' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      table.status === 'occupied' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    } border`}
                  >
                    {table.status === 'free' && <Utensils className="h-8 w-8 mb-2" />}
                    {table.status === 'occupied' && <Zap className="h-8 w-8 mb-2" />}
                    {table.status === 'billed' && <CreditCard className="h-8 w-8 mb-2" />}
                    <p className="text-xl">{table.number}</p>
                    <p className="capitalize mt-1 text-sm">{table.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Active Orders</CardTitle>
              <CardDescription>
                Click an order to see details.
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
                      className="p-4 border rounded-lg cursor-pointer hover:bg-secondary flex justify-between items-center transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-4 ${
                          order.status === 'pending' ? 'bg-yellow-500' :
                          order.status === 'confirmed' ? 'bg-blue-500' :
                          order.status === 'completed' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-semibold text-card-foreground">
                            Order #{order.id} - Table {order.table_id}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {order.items.length} items • {order.status}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">₹{order.total_price.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id} - Table {selectedOrder?.table_id}</DialogTitle>
            <DialogDescription>
              <Badge variant={selectedOrder?.status === 'cancelled' ? 'destructive' : 'default'}>
                {selectedOrder?.status}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <h4 className="font-semibold">Items</h4>
            {selectedOrder?.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-foreground">{item.item.name} (x{item.quantity})</span>
                <span className="text-muted-foreground capitalize">{item.status}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-primary">₹{selectedOrder?.total_price.toFixed(2)}</span>
          </div>
          <DialogFooter className="mt-6 grid grid-cols-2 gap-2">
            <Button className="col-span-2" onClick={() => router.push(`/invoice/${selectedOrder?.id}`)}>
              Generate Invoice
            </Button>
            <Button variant="outline" onClick={() => handleUpdateOrderStatus('completed')}>Mark as Completed</Button>
            <Button variant="outline" onClick={() => handleUpdateOrderStatus('cancelled')}>Cancel Order</Button>
            <Button variant="destructive" className="col-span-2" onClick={handleDeleteOrder}>Delete Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 