const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  await prisma.table.createMany({
    data: [
      { number: 1 },
      { number: 2 },
      { number: 3 },
      { number: 4 },
      { number: 5 },
    ],
    skipDuplicates: true,
  });

  await prisma.menuItem.createMany({
    data: [
      { 
        name: 'Margherita Pizza', 
        price: 350, 
        category: 'Main Course', 
        is_veg: true,
        image_url: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&q=80&w=1928&ixlib=rb-4.0.3'
      },
      { 
        name: 'Caesar Salad', 
        price: 250, 
        category: 'Starters', 
        is_veg: false,
        image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3'
      },
      { 
        name: 'Chocolate Lava Cake', 
        price: 180, 
        category: 'Desserts', 
        is_veg: true,
        image_url: 'https://images.aws.nestle.recipes/resized/2020_06_23T12_02_56_mrs_ImageRecipes_147148lrg_1080_850.jpg'
      },
      { 
        name: 'Coca-Cola', 
        price: 80, 
        category: 'Drinks', 
        is_veg: true,
        image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=1964&ixlib=rb-4.0.3'
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 