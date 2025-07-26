# ISP Inventory App - Quick Install & Config Guide

## 🚀 Prerequisites

### System Requirements
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Optional (Recommended)
- **Docker & Docker Compose** ([Install Guide](https://docs.docker.com/get-docker/))

## 📦 Installation Methods

### Method 1: Docker Deployment (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/your-repo/isp-inventory-app.git
cd isp-inventory-app

# 2. Setup environment
cp .env.example .env
nano .env  # Edit with your values

# 3. Install Docker (if not installed)
# On Arch Linux:
sudo pacman -S docker docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
# Logout and login again

# 4. Deploy with Docker
docker compose up -d

# 5. Check status
docker compose ps
```

### Method 2: Manual Installation

```bash
# 1. Clone repository
git clone https://github.com/your-repo/isp-inventory-app.git
cd isp-inventory-app

# 2. Setup PostgreSQL database
sudo -u postgres psql
CREATE DATABASE isp_inventory;
CREATE USER inventory_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE isp_inventory TO inventory_user;
\q

# 3. Backend setup
cd backend
npm install
cp .env.example .env
nano .env  # Configure database connection
npm run build
npm run migrate
npm run seed
npm start &  # Run in background

# 4. Frontend setup
cd ../frontend
npm install
npm run build
npm run preview &  # Run in background
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Database
DB_USER=inventory_user
DB_PASSWORD=your_secure_password
DB_NAME=isp_inventory
DB_PORT=5432

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Ports
BACKEND_PORT=3000
FRONTEND_PORT=5173

# Optional: Redis for caching
REDIS_PASSWORD=redis_password
REDIS_PORT=6379
```

### Production Settings
For production deployment, copy `.env.production` and customize:
```bash
cp .env.production .env
nano .env  # Update with your production values
```

## 🔍 Deployment Verification

### Quick Health Check
```bash
# Check if services are running
curl http://localhost:3000/health
curl http://localhost:5173

# Check Docker containers (if using Docker)
docker compose ps
docker compose logs backend
```

### Complete Verification Script
```bash
#!/bin/bash
echo "=== ISP Inventory App Deployment Verification ==="

# Check Node.js version
echo "Node.js version:"
node --version

# Check if PostgreSQL is accessible
echo "Testing database connection..."
pg_isready -h localhost -p 5432 -U inventory_user

# Check backend API
echo "Testing backend API..."
curl -s http://localhost:3000/health | jq . || echo "Backend not responding"

# Check frontend
echo "Testing frontend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200" && echo "Frontend OK" || echo "Frontend not responding"

# Check Docker (if using Docker)
if command -v docker &> /dev/null; then
    echo "Docker containers status:"
    docker compose ps
fi

echo "=== Verification Complete ==="
```

## 🌐 Access URLs

After successful deployment:

- **Frontend (User Interface)**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **API Documentation**: See `API_DOCUMENTATION.md`

### Default Login Credentials
```
Admin: admin@company.com / admin123
Manager: manager@company.com / manager123
Staff: staff@company.com / staff123
```

## 📱 Features Available

✅ **Inventory Management** - Add, edit, delete items  
✅ **Barcode/QR Scanning** - Camera-based scanning  
✅ **Stock Movement Tracking** - In/Out/Adjustments  
✅ **Reports & Analytics** - Various reports with CSV export  
✅ **User Management** - Role-based access control  
✅ **PWA Support** - Install on mobile devices  
✅ **Real-time Updates** - Live inventory updates  

## 🛠️ Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql
sudo systemctl start postgresql

# Test connection
psql -h localhost -U inventory_user -d isp_inventory
```

**2. Port Already in Use**
```bash
# Check what's using the port
sudo ss -tlnp | grep :3000
sudo ss -tlnp | grep :5173

# Kill process or change port in .env
```

**3. Permission Issues**
```bash
# Fix upload directory permissions
mkdir -p uploads/{barcodes,qrcodes,stickers}
chmod -R 755 uploads/
```

**4. Frontend Build Issues**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docker Issues
```bash
# Restart all services
docker compose down
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild images
docker compose build --no-cache
```

## 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Set strong JWT secret (32+ characters)
- [ ] Update database credentials
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Regular backups

## 🚦 Quick Start Commands

```bash
# Start development
npm run dev  # Backend
npm run dev  # Frontend (in another terminal)

# Build for production
npm run build  # Both backend and frontend

# Database operations
npm run migrate  # Run migrations
npm run seed     # Seed initial data

# Docker operations
docker compose up -d        # Start all services
docker compose down         # Stop all services
docker compose logs -f      # View logs
```

## 📞 Support

- **Documentation**: Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- **API Reference**: See `API_DOCUMENTATION.md`
- **Issues**: Create issue on GitHub repository

## 🎯 Next Steps

1. **Test basic functionality**: Login, add items, scan barcodes
2. **Configure users**: Set up proper user accounts
3. **Import data**: Use CSV import for existing inventory
4. **Setup backup**: Configure automatic database backups
5. **Enable HTTPS**: Set up SSL certificate for production

---

**Total setup time: ~15 minutes** ⏱️

For detailed production deployment, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
