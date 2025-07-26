# ISP Inventory Management System

A comprehensive inventory management system with barcode/QR code scanning capabilities, built for Internet Service Providers (ISPs) and other businesses requiring efficient inventory tracking.

## 🚀 Features

### ✅ Core Features
- **Modern Web Application** - Built with React, TypeScript, Node.js
- **Progressive Web App (PWA)** - Install on mobile devices for offline access
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Authentication & Authorization** - Role-based access control (Admin, Manager, Staff)
- **Real-time Updates** - Socket.IO for live inventory updates

### 📦 Inventory Management
- **CRUD Operations** - Complete inventory item management
- **Category Management** - Organize items by categories
- **Supplier Management** - Track suppliers and vendor information
- **Stock Movement Tracking** - Monitor in/out/adjustment movements
- **Low Stock Alerts** - Automatic notifications for items below minimum threshold

### 📱 Barcode & QR Code Features
- **Camera Scanning** - Scan barcodes/QR codes using device camera
- **Code Generation** - Auto-generate barcodes and QR codes for items
- **Printable Stickers** - Generate PDF stickers for physical labeling
- **Bulk Operations** - Generate codes for multiple items at once
- **Multiple Formats** - Support for CODE128, EAN13, EAN8, QR codes

### 📊 Reports & Analytics
- **Stock Opname Report** - Complete inventory status overview
- **Stock Variance Report** - Track discrepancies and adjustments
- **Monthly Movement Report** - Analyze inventory movements over time
- **Analytics Dashboard** - Key metrics and insights
- **Stock Aging Report** - Identify slow-moving inventory
- **CSV Export** - Export all reports to CSV format

### 🔧 Technical Features
- **RESTful API** - Well-documented REST endpoints
- **Database Migrations** - Structured database versioning
- **File Upload Support** - Item images and document attachments
- **Rate Limiting** - API protection and abuse prevention
- **Error Handling** - Comprehensive error management
- **Health Monitoring** - Application health check endpoints
- **Docker Support** - Easy deployment with Docker Compose

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React PWA)   │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   File Storage  │    │   Redis Cache   │
│   (Reverse      │    │   (uploads/)    │    │   (Optional)    │
│   Proxy)        │    │                 │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Lucide React** - Modern icon library
- **PWA Support** - Service workers and manifest

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **PostgreSQL** - Relational database
- **Knex.js** - SQL query builder and migrations
- **JWT** - JSON Web Token authentication
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Canvas & JsBarcode** - Barcode generation
- **QRCode** - QR code generation
- **PDFKit** - PDF generation

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving
- **PM2** - Process management (optional)

## 📋 Prerequisites

- **Node.js** 18+ 
- **Docker & Docker Compose** (recommended)
- **PostgreSQL** 15+ (if not using Docker)
- **Git**

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/isp-inventory-app.git
cd isp-inventory-app
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

Required environment variables:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_management
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Secret (minimum 32 characters)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 4. Manual Setup (Alternative)
```bash
# Backend setup
cd backend
npm install
npm run migrate
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm run build
npm run preview
```

## 📱 Usage

### Web Application
- **Desktop Dashboard**: http://localhost:3000/dashboard
- **Mobile PWA**: http://localhost:3000 (install as PWA)

### API Endpoints
- **Health Check**: http://localhost:5000/health
- **API Documentation**: See `API_DOCUMENTATION.md`

### Default Credentials
```
Admin: admin@company.com / admin123
Manager: manager@company.com / manager123  
Staff: staff@company.com / staff123
```

## 📖 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Barcode API](BARCODE_API.md)** - Barcode/QR code functionality
- **[Activity Reports](ACTIVITY_REPORTS_API.md)** - Reporting system details

## 🔧 Development

### Local Development
```bash
# Backend development
cd backend
npm run dev

# Frontend development
cd frontend  
npm run dev
```

### Database Operations
```bash
# Run migrations
npm run migrate

# Rollback migration
npm run rollback

# Create new migration
npm run make:migration migration_name

# Seed database
npm run seed
```

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 📊 Features Overview

### Mobile PWA Features
- 📱 **Home Screen Installation** - Add to device home screen
- 🔍 **Barcode Scanner** - Camera-based scanning
- 📦 **Quick Inventory** - View and search items
- 👤 **User Profile** - Account management
- 🔄 **Offline Support** - Basic functionality without internet

### Desktop Dashboard Features  
- 📊 **Analytics Dashboard** - Key metrics and charts
- 📦 **Inventory Management** - Full CRUD operations
- 📈 **Stock Movements** - Movement history and tracking
- 🏷️ **Categories & Suppliers** - Master data management
- 📋 **Comprehensive Reports** - Various report types
- 🔍 **Advanced Search** - Filter and search capabilities
- 👥 **User Management** - Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **Database Connection**: Check PostgreSQL service and credentials
- **File Permissions**: Ensure uploads directory is writable
- **Port Conflicts**: Check if ports 3000, 5000, 5432 are available
- **PWA Installation**: Use HTTPS in production for PWA features

### Getting Help
1. Check existing [Issues](https://github.com/your-username/isp-inventory-app/issues)
2. Review documentation files
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] **Mobile App** - React Native version
- [ ] **Advanced Analytics** - More detailed reporting
- [ ] **Multi-location Support** - Multiple warehouse locations
- [ ] **Integrations** - Third-party system integrations
- [ ] **Automated Reordering** - Smart stock replenishment
- [ ] **Audit Trail** - Complete change tracking

## 👥 Team

- **Backend Development** - Node.js, PostgreSQL, API design
- **Frontend Development** - React, TypeScript, PWA implementation  
- **DevOps** - Docker, deployment, CI/CD
- **QA & Testing** - Testing strategies and quality assurance

---

**Built with ❤️ for efficient inventory management**

For detailed setup instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
