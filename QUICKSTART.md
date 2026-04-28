# Quick Start Guide

## 1. Database Setup

Install PostgreSQL and run:
```sql
CREATE DATABASE society_order;
```

Or use the provided SQL file:
```bash
psql -U postgres -f backend/setup.sql
```

Update `backend/.env` with your database credentials.

## 2. Start Backend

```bash
cd backend
npm install
node src/scripts/seed.js  # Add sample products
npm run dev
```

Backend runs at http://localhost:5000

## 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## 4. Create Admin User

The easiest way to create an admin user is to:
1. Register a user at http://localhost:5173/register
2. Connect to the database and update the user role:
   ```sql
   UPDATE users SET role = 'admin', status = 'approved' WHERE phone = 'YOUR_PHONE';
   ```

## Default Flow

1. User registers → status: `pending`
2. Admin approves user → status: `approved`
3. User can now login and place orders
4. Staff can accept/deliver orders or create POS orders
5. Admin can manage users and view analytics
