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
  menu: MenuItem[];
  addToCart: (item: MenuItem) => void;
}

export default function Menu({ menu, addToCart }: MenuProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-foreground">Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menu.map((item) => (
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
  );
} 