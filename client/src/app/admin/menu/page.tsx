'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  is_veg: boolean;
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      if ('id' in editingItem && editingItem.id) {
        await axios.put(`http://localhost:5000/api/menu/${editingItem.id}`, editingItem);
      } else {
        await axios.post('http://localhost:5000/api/menu', editingItem);
      }
      fetchMenuItems();
      closeModal();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/menu/${itemToDelete.id}`);
      fetchMenuItems();
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const openModal = (item: Partial<MenuItem> | null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (value: string) => {
    setEditingItem(prev => ({ ...prev, category: value }));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
        <Button onClick={() => router.push('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">Menu Items</CardTitle>
            <CardDescription>
              Add, edit, or delete menu items.
            </CardDescription>
          </div>
          <Button onClick={() => openModal({ name: '', price: 0, category: 'Starters', is_veg: false })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.is_veg ? 'Veg' : 'Non-Veg'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModal(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveItem}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={editingItem?.name || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" value={editingItem?.price || 0} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" onValueChange={handleSelectChange} value={editingItem?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starters">Starters</SelectItem>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                    <SelectItem value="Drinks">Drinks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Input id="is_veg" name="is_veg" type="checkbox" checked={editingItem?.is_veg} onChange={handleInputChange} className="h-4 w-4" />
                <Label htmlFor="is_veg">Vegetarian</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <CardDescription>
              This action cannot be undone. This will permanently delete the item.
            </CardDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 