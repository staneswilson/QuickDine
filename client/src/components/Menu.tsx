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

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <section>
      {loading ? (
        <p className="text-muted-foreground">Loading menu...</p>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-3xl font-semibold mb-8 capitalize text-primary">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item) => (
                  <div key={item.id} className="bg-card rounded-lg shadow-sm flex flex-col border overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                    <img
                      src={item.image_url || `https://source.unsplash.com/random/400x300?${item.name.replace(/\s/g,',')}`}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex-grow">
                        <h4 className="text-xl font-bold text-card-foreground">{item.name}</h4>
                        <p className="text-muted-foreground mt-2">
                          {item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <p className="text-2xl font-semibold text-primary">
                          ₹{item.price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 