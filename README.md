# Society Ordering & POS System

A full-stack web application for gated society café and grocery ordering with staff POS system.

## Features

- **Customer Portal**: Browse products, add to cart, place orders, track order status, leave reviews
- **Staff Dashboard**: Manage online orders (accept/deliver/reject), POS system for walk-in customers, product management
- **Admin Panel**: User approval system, monitor all orders, revenue analytics

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- JWT Authentication + Role-based Access Control
- Socket.io for real-time notifications

### Frontend
- React + Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Router DOM

## Setup Instructions

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL 14+

### Backend Setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE society_order;
   ```

2. Configure environment:
   ```bash
   cd backend
   copy .env.example .env
   # Edit .env with your database credentials
   ```

3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```
   Backend runs on http://localhost:5000

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure API URL in `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:5173

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Products
- GET `/api/products` - List products
- POST `/api/products` - Create product (Staff/Admin)
- PUT `/api/products/:id` - Update product (Staff/Admin)
- DELETE `/api/products/:id` - Delete product (Admin)
- PATCH `/api/products/:id/toggle` - Toggle availability (Staff/Admin)

### Orders
- GET `/api/orders` - List orders (role-based)
- POST `/api/orders` - Create online order (Customer)
- PATCH `/api/orders/:id/accept` - Accept order (Staff)
- PATCH `/api/orders/:id/deliver` - Mark delivered (Staff)
- PATCH `/api/orders/:id/reject` - Reject order (Staff)
- POST `/api/orders/onsite` - Create POS order (Staff)

### Admin
- GET `/api/admin/users/pending` - Pending approvals
- PATCH `/api/admin/users/:id/approve` - Approve user
- PATCH `/api/admin/users/:id/block` - Block user
- GET `/api/admin/orders` - All orders
- GET `/api/admin/analytics` - Revenue stats

## User Roles

| Role | Permissions |
|------|-------------|
| Customer | Browse products, place orders, view order history, leave reviews |
| Staff | Manage orders (accept/deliver), POS system, manage products |
| Admin | Approve/block users, view all orders, system analytics |

## Order States

**Online Orders**: `pending` → `accepted` → `delivered` (or `rejected`)
**POS Orders**: Created as `accepted` with payment status `paid`

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/      # Database config
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth, RBAC middleware
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   └── utils/        # JWT, validators
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Role-based pages
│   │   ├── utils/         # API, protected routes
│   │   └── App.jsx
│   └── package.json
└── README.md
```
