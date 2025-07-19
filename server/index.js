require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000"
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
});

// --- AUTH MIDDLEWARE ---
const authorizeAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
// --- END AUTH MIDDLEWARE ---

// --- USER MANAGEMENT ROUTES (Admin only) ---
app.get('/api/users', authorizeAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authorizeAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword, role },
    });
    res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { username, role },
    });
    res.json({ id: updatedUser.id, username: updatedUser.username, role: updatedUser.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
// --- END USER MANAGEMENT ROUTES ---

// --- METRICS ROUTES (Admin only) ---
app.get('/api/metrics/revenue', authorizeAdmin, async (req, res) => {
  try {
    const result = await prisma.order.aggregate({
      _sum: {
        total_price: true,
      },
      where: {
        status: 'completed',
      },
    });
    const totalRevenue = result._sum.total_price || 0;
    // Placeholder for percentage change calculation
    const percentageChange = 20.1; 
    res.json({ totalRevenue, percentageChange });
  } catch (error) {
    console.error('Failed to fetch revenue:', error);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});
// --- END METRICS ROUTES ---

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for username:', username);

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found:', user.username, 'Role:', user.role);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', username);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
// --- END AUTH ROUTES ---


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
    
    // Broadcast the status update to all clients
    io.emit('tableStatusUpdated', updatedTable);
    
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

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { items: { include: { item: true } } },
    });
    io.emit('orderStatusUpdated', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    console.error(`Failed to update status for order ${id}:`, error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({
      where: { id: parseInt(id) },
    });
    io.emit('orderDeleted', parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete order ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete order' });
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

// --- DUMMY PAYMENT INTEGRATION ---
app.post("/api/payment/create-order", async (req, res) => {
  console.log("DUMMY: Creating payment order", req.body);
  // In a real scenario, you'd interact with a payment gateway.
  // Here, we just create a dummy order ID.
  const dummyOrderId = "order_" + crypto.randomBytes(12).toString("hex");
  res.json({ id: dummyOrderId, amount: req.body.amount * 100 });
});

app.post("/api/payment/verify", (req, res) => {
  console.log("DUMMY: Verifying payment", req.body);
  // In a real scenario, you'd verify a signature.
  // Here, we just simulate a successful verification.
  res.json({ success: true, message: "Payment verified successfully (dummy)" });
});
// --- END DUMMY PAYMENT INTEGRATION ---

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