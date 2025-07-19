'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center text-center p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-primary mb-6">
          Welcome to QuickDine
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12">
          The future of dining is here. Scan, order, and pay, all from the comfort of your table.
        </p>
        <div className="bg-card p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold text-card-foreground mb-4">
            How it Works
          </h2>
          <div className="flex flex-col md:flex-row justify-around items-center space-y-8 md:space-y-0 md:space-x-8 text-left">
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-primary">1.</span>
              <div>
                <h3 className="text-xl font-semibold">Scan</h3>
                <p className="text-muted-foreground">Use your phone to scan the QR code at your table.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-primary">2.</span>
              <div>
                <h3 className="text-xl font-semibold">Order</h3>
                <p className="text-muted-foreground">Browse our digital menu and place your order.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-primary">3.</span>
              <div>
                <h3 className="text-xl font-semibold">Enjoy</h3>
                <p className="text-muted-foreground">Your order is sent directly to the kitchen. Relax and enjoy!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="mt-16">
        <p className="text-muted-foreground">
          To test the ordering flow, navigate to{' '}
          <a href="/order/1" className="text-primary font-semibold hover:underline">
            /order/1
          </a>
        </p>
      </footer>
    </div>
  );
}
