const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
      { name: 'Margherita Pizza', price: 12.99, category: 'Main Course', is_veg: true },
      { name: 'Caesar Salad', price: 8.99, category: 'Starters', is_veg: false },
      { name: 'Chocolate Lava Cake', price: 6.99, category: 'Desserts', is_veg: true },
      { name: 'Coca-Cola', price: 2.50, category: 'Drinks', is_veg: true },
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