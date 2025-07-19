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
import { useAuth } from '@/auth/useAuth';

interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', getAuthHeaders());
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      if (editingUser.id) {
        await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, editingUser, getAuthHeaders());
      } else {
        await axios.post('http://localhost:5000/api/users', editingUser, getAuthHeaders());
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${userToDelete.id}`, getAuthHeaders());
      fetchUsers();
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const openModal = (user: Partial<User> | null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setEditingUser(prev => ({ ...prev, role: value }));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <Button onClick={() => router.push('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">Staff Accounts</CardTitle>
            <CardDescription>
              Add, edit, or delete user accounts.
            </CardDescription>
          </div>
          <Button onClick={() => openModal({ username: '', role: 'waiter' })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModal(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
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
            <DialogTitle>{editingUser?.id ? 'Edit' : 'Add'} User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={editingUser?.username || ''} onChange={handleInputChange} />
              </div>
              {!editingUser?.id && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" onChange={handleInputChange} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" onValueChange={handleSelectChange} value={editingUser?.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                  </SelectContent>
                </Select>
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
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <CardDescription>
              This action will permanently delete the user account.
            </CardDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 