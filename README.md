# QuickDine: QR-Based Restaurant Ordering System

[![💻 Built at TinkerSpace](https://img.shields.io/badge/Built%20at-TinkerSpace-blueviolet?style=for-the-badge&label=%F0%9F%92%BBBuilt%20at&labelColor=turquoise&color=white)](https://tinkerhub.org/tinkerspace)

QuickDine is a modern, full-stack restaurant management solution that enables contactless ordering, real-time updates, and efficient administration through a polished and intuitive user interface.

## 🎥 Demo Video

Watch QuickDine in action: [https://youtu.be/8p_t-F_ZToU](https://youtu.be/8p_t-F_ZToU)

## Features

- **QR Code Ordering**: Customers can scan a table-specific QR code to instantly access the menu.
- **Dynamic Digital Menu**: A beautiful, responsive menu that admins can manage.
- **Real-Time Order System**: Orders are sent to the kitchen and updated in real-time for customers and staff using WebSockets.
- **Admin Dashboard**: A secure dashboard for restaurant owners to view sales metrics, manage orders, and oversee operations.
- **User Management**: Admins can create, update, and delete staff accounts with different roles (Admin, Staff).
- **Kitchen Display System (KDS)**: A dedicated, real-time view for kitchen staff to track and manage incoming orders.
- **Secure Authentication**: JWT-based authentication for staff and admin roles.
- **Modern UI/UX**: Built with Tailwind CSS, featuring a professional design, dark mode, and full responsiveness across all devices.

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS, Shadcn/UI, Socket.IO Client
- **Backend**: Node.js, Express.js, Prisma ORM, Socket.IO
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database instance

### 1. Server Setup

First, set up the backend server:

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create a .env file and add your database URL and a JWT secret
# (see .env.example)
touch .env

# 4. Apply database schema and run migrations
npx prisma migrate dev

# 5. Seed the database with initial data (including an admin user)
npm run seed

# 6. Start the server
npm start
```

Your server will be running at `http://localhost:5000`.

**`.env.example` for server:**

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"

# A long, random string for signing JWTs
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"
```

### 2. Client Setup

Next, set up the frontend client:

```bash
# 1. Navigate to the client directory from the root
cd client

# 2. Install dependencies
npm install

# 3. Create a .env.local file to specify the backend API URL
touch .env.local

# 4. Start the client development server
npm run dev
```

Your client application will be running at `http://localhost:3000`.

**`.env.local.example` for client:**

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### 3. Accessing the Application

- **Customer View**: Navigate to `http://localhost:3000`. Click "Order Now" to start the ordering process.
- **Admin Login**: Navigate to `http://localhost:3000/login`.
- **Default Admin Credentials**:
  - **Email**: `admin`
  - **Password**: `password`

You can now explore the full application, including the admin dashboard, user management, and kitchen display system.