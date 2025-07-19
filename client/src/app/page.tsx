'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ChefHat, UtensilsCrossed, Zap } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const router = useRouter();

  const handleOrderNow = () => {
    if (customerName.trim() && customerPhone.trim()) {
      // In a real app, you'd save this info, maybe in localStorage or state management
      console.log('Customer Details:', { customerName, customerPhone });
      setIsModalOpen(false);
      router.push('/scan'); // Redirect to the scan page after getting details
    } else {
      alert('Please enter your name and phone number.');
    }
  };

  const menuHighlights = [
    {
      name: 'Chicken Biriyani',
      image: 'https://images.unsplash.com/photo-1697155406055-2db32d47ca07?q=80&w=800',
      description: 'A fiery and flavorful chicken biriyani.',
    },
    {
      name: 'Porotta',
      image: 'https://media.istockphoto.com/id/1301428688/photo/food-concept-spot-focus-homemade-paratha-parotta-or-porotta-layered-flatbread-on-black.webp?a=1&b=1&s=612x612&w=0&k=20&c=p1ukgz1q1FCu6rUgrW21jHLnEgzvi1QqCAUVtjfl7IM=',
      description: 'A crispy and flavorful porotta.',
    },
    {
      name: 'Chicken Curry',
      image: 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?q=80&w=800',
      description: 'A crispy and flavorful porotta.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute top-0 right-0 p-4 z-20">
        <ModeToggle />
      </header>
      <section
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white p-4"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
            Welcome to QuickDine
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Experience the future of dining. Order from your table, your way.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="group w-full sm:w-auto rounded-full border-2 border-primary-foreground/20 shadow-lg shadow-primary/50 transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/80 hover:scale-105"
                >
                  Order Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Enter Your Details</DialogTitle>
                  <DialogDescription>
                    Please provide your name and phone number to proceed with your order.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <Button onClick={handleOrderNow} className="w-full">Proceed to Order</Button>
              </DialogContent>
            </Dialog>

            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white rounded-full hover:bg-white hover:text-black transition-colors">
              <Link href="/login">
                Restaurant Login
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Why QuickDine?</h2>
          <p className="text-muted-foreground mb-12">A seamless experience for you and your customers.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg">
              <Zap className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast Orders</h3>
              <p className="text-muted-foreground">Customers scan, tap, and order in seconds. No more waiting for a server.</p>
            </div>
            <div className="p-6 rounded-lg">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dynamic Menu</h3>
              <p className="text-muted-foreground">Update your menu in real-time. 86 an item or add a special with one click.</p>
            </div>
            <div className="p-6 rounded-lg">
              <ChefHat className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Kitchen Efficiency</h3>
              <p className="text-muted-foreground">Orders are sent directly to the kitchen display, reducing errors and speeding up prep time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">From Our Menu</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {menuHighlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-0">
                    <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-t-lg" />
                    <div className="p-4">
                      <CardTitle className="text-xl font-semibold">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 bg-secondary/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} QuickDine. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
