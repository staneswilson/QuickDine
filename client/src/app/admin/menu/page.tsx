'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  is_veg: boolean;
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    is_veg: false,
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/menu');
        setMenuItems(response.data);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewItem({
      ...newItem,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/menu', {
        ...newItem,
        price: parseFloat(newItem.price),
      });
      setMenuItems([...menuItems, response.data]);
      setIsAddModalOpen(false);
      setNewItem({ name: '', price: '', category: '', is_veg: false });
    } catch (error) {
      console.error('Failed to add menu item:', error);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/menu/${selectedItem.id}`,
        {
          ...newItem,
          price: parseFloat(newItem.price),
        }
      );
      setMenuItems(
        menuItems.map((item) =>
          item.id === selectedItem.id ? response.data : item
        )
      );
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update menu item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await axios.delete(`http://localhost:5000/api/menu/${selectedItem.id}`);
      setMenuItems(menuItems.filter((item) => item.id !== selectedItem.id));
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      is_veg: item.is_veg,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
      <div className="mb-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Add New Item
        </button>
      </div>
      <table className="w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Price</th>
            <th className="text-left p-3">Veg</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.category}</td>
              <td className="p-3">${item.price.toFixed(2)}</td>
              <td className="p-3">{item.is_veg ? 'Yes' : 'No'}</td>
              <td className="p-3">
                <button
                  onClick={() => openEditModal(item)}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(item)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
            <form onSubmit={handleAddItem}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="is_veg"
                    checked={newItem.is_veg}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Vegetarian</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-500 mr-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Edit Menu Item</h2>
            <form onSubmit={handleUpdateItem}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="is_veg"
                    checked={newItem.is_veg}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Vegetarian</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 mr-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Delete Menu Item</h2>
            <p>
              Are you sure you want to delete the item:{" "}
              <strong>{selectedItem.name}</strong>?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 