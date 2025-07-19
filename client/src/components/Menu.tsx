'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  is_veg: boolean;
  image_url: string | null;
  available: boolean;
}

interface MenuProps {
  addToCart: (item: MenuItem) => void;
}

export default function Menu({ addToCart }: MenuProps) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/menu');
        setMenu(response.data);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Menu</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        {loading ? (
          <p>Loading menu...</p>
        ) : (
          <div>
            {Object.entries(
              menu.reduce((acc, item) => {
                if (!acc[item.category]) {
                  acc[item.category] = [];
                }
                acc[item.category].push(item);
                return acc;
              }, {} as Record<string, MenuItem[]>)
            ).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h3 className="text-lg font-bold mb-2">{category}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between mb-2">
                      <div>
                        <span>{item.name}</span>
                        <span className="text-sm text-gray-500 ml-2">(${item.price.toFixed(2)})</span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 