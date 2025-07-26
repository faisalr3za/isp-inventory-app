# CloudBit ISP Inventory System

## Struktur Proyek

```
isp-inventory-app/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, etc
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration files
│   ├── tests/              # Unit & integration tests
│   └── public/uploads/     # File uploads (temp)
│
├── frontend/               # React Web App
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   ├── services/       # API calls
│   │   └── assets/         # Static assets
│   └── public/             # Public files
│
├── mobile/                 # React Native App
│   ├── src/
│   │   ├── screens/        # Mobile screens
│   │   ├── components/     # Mobile components
│   │   ├── services/       # API & storage
│   │   ├── utils/          # Helper functions
│   │   └── assets/         # Images, fonts
│   ├── android/            # Android specific
│   └── ios/                # iOS specific
│
├── database/               # Database scripts
│   ├── migrations/         # Schema migrations
│   ├── seeders/           # Sample data
│   └── schemas/           # SQL schemas
│
└── docs/                   # Documentation
    ├── api/               # API documentation
    ├── user-manual/       # User guides
    └── deployment/        # Deployment guides
```

## Tech Stack

- **Backend**: Node.js + Express.js + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Mobile**: React Native + TypeScript
- **Database**: PostgreSQL
- **Storage**: IDCloudHost S3
- **Auth**: JWT + bcrypt
- **Real-time**: Socket.IO

## Features

### ✅ Inventory Management (Completed)
- **Categories Management**: CRUD operations untuk kategori inventory
- **Suppliers Management**: Data supplier dan vendor
- **Items Management**: 
  - SKU-based tracking
  - Multi-category support
  - Stock levels (minimum/maximum)
  - Condition tracking (new, good, fair, poor, damaged)
  - Location-based inventory
  - Barcode & serial number support
  - Specifications & notes
- **Stock Management**:
  - Stock in/out movements
  - Stock adjustments
  - Movement history & audit trail
  - Low stock alerts
  - Real-time stock updates (Socket.IO)

### 🔐 Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers

### 📊 Coming Soon
- Reports & Analytics
- Customer Management
- Order Management
- Barcode Scanning (Mobile)
- WhatsApp Notifications
- Advanced Search & Filtering

## Quick Start

### Automatic Setup (Recommended)
```bash
# Clone repository
git clone https://github.com/your-repo/isp-inventory-app.git
cd isp-inventory-app

# Run automatic setup
./setup-dev.sh

# Start development servers
cd backend && npm run dev
# In another terminal:
cd frontend && npm run dev
```

### Manual Setup
1. Setup PostgreSQL database
2. Copy `backend/.env.example` to `backend/.env`
3. Configure database connection in `.env`
4. Install dependencies: `cd backend && npm install`
5. Run migrations: `npm run migrate`
6. Run seeders: `npm run seed`
7. Start server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/:id` - Get supplier by ID
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Inventory Items
- `GET /api/inventory` - Get all items (with filters)
- `POST /api/inventory` - Create new item
- `GET /api/inventory/:id` - Get item by ID
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `POST /api/inventory/:id/adjust-stock` - Adjust stock
- `GET /api/inventory/low-stock` - Get low stock items

### Inventory Movements
- `GET /api/inventory/movements` - Get all movements (with filters)
- `GET /api/inventory/:id/movements` - Get movements for specific item
- `GET /api/inventory/movements/stats` - Get movement statistics

## Database Schema

### Core Tables
- `users` - User accounts
- `categories` - Inventory categories
- `suppliers` - Supplier information
- `inventory_items` - Main inventory items
- `inventory_movements` - Stock movement history

## Environment Variables

Pastikan file `.env` tersedia di folder backend dengan konfigurasi yang sesuai:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloudbit_inventory
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
```
