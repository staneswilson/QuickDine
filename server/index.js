const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to QuickDine API</h1>");
});

app.get("/api/menu", async (req, res) => {
  try {
    const menu = await prisma.menuItem.findMany();
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

app.get("/api/orders/active", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          not: "completed",
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch active orders" });
  }
});

app.get("/api/tables", async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: {
        number: "asc",
      },
    });
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

app.put("/api/tables/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedTable = await prisma.table.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });
    res.json(updatedTable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update table status" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.post("/api/menu", async (req, res) => {
  try {
    const newItem = await prisma.menuItem.create({
      data: req.body,
    });
    res.json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

app.put("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

app.delete("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinTable', (tableId) => {
    socket.join(tableId);
    console.log(`User joined table ${tableId}`);
  });

  socket.on('placeOrder', async ({ cart, tableId }) => {
    try {
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

      const order = await prisma.order.create({
        data: {
          table_id: parseInt(tableId, 10),
          total_price: total,
          items: {
            create: cart.map((item) => ({
              item_id: item.id,
              quantity: item.quantity,
              note: '', // TODO: Add notes from the cart
            })),
          },
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      // Broadcast the new order to the kitchen
      io.emit('newOrder', order);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  });

  socket.on('updateOrderItemStatus', async ({ orderId, itemId, status }) => {
    try {
      const updatedItem = await prisma.orderItem.update({
        where: { id: itemId },
        data: { status },
      });

      io.emit('orderItemStatusUpdated', {
        orderId,
        itemId,
        status,
      });
    } catch (error) {
      console.error('Failed to update order item status:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 