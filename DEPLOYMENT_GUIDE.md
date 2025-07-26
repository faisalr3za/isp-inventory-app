# Deployment Guide - ISP Inventory Management System

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if not using Docker)

### 1. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` file with your production values:
```bash
# Required - Change these values
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
DB_PASSWORD=your_secure_database_password

# Optional - Adjust as needed
PORT=5000
DB_NAME=inventory_management
```

### 2. Docker Deployment (Recommended)

#### Quick Deploy
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

#### Production Deployment
```bash
# Pull latest images
docker-compose pull

# Build with no cache
docker-compose build --no-cache

# Start services
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run migrate

# Create uploads directories
docker-compose exec backend mkdir -p uploads/{barcodes,qrcodes,stickers}
```

### 3. Manual Deployment

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values

# Create upload directories
mkdir -p uploads/{barcodes,qrcodes,stickers}

# Run database migrations
npm run migrate

# Start production server
npm start
```

#### Database Setup
```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE inventory_management;
CREATE USER inventory_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inventory_management TO inventory_user;
```

## API Endpoints

The application will be available at:
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Documentation**: See `API_DOCUMENTATION.md`

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | production | No |
| `PORT` | Server port | 5000 | No |
| `DB_HOST` | Database host | localhost | Yes |
| `DB_PORT` | Database port | 5432 | No |
| `DB_NAME` | Database name | inventory_management | Yes |
| `DB_USER` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration | 7d | No |
| `FRONTEND_URL` | Frontend URL | http://localhost:3000 | No |

### Database Configuration

The application uses PostgreSQL with the following tables:
- `users` - User authentication
- `inventory_items` - Inventory management
- `stock_movements` - Stock tracking
- `categories` - Item categories
- `suppliers` - Supplier management

### File Storage

Upload directories are automatically created:
- `uploads/barcodes/` - Generated barcodes
- `uploads/qrcodes/` - Generated QR codes
- `uploads/stickers/` - Printable stickers

## Features Available

### ✅ Core Features
- **Authentication & Authorization** - JWT-based user management
- **Inventory Management** - CRUD operations for inventory items
- **Stock Movement Tracking** - In/Out/Adjustment tracking
- **Barcode & QR Code Generation** - Auto-generate codes for items
- **Barcode Scanning** - Scan codes for quick operations
- **Categories & Suppliers** - Organize inventory data

### ✅ Reporting Features
- **Stock Opname Report** - Complete inventory status
- **Stock Variance Report** - Track discrepancies
- **Monthly Movement Report** - Movement analysis
- **Analytics Dashboard** - Key metrics and insights
- **Stock Aging Report** - Identify slow-moving items
- **CSV Export** - Export reports to CSV

### ✅ Advanced Features
- **Real-time Updates** - Socket.IO integration
- **File Upload** - Support for item images
- **Rate Limiting** - API protection
- **Error Handling** - Comprehensive error management
- **Health Monitoring** - Health check endpoints

## API Usage Examples

### Authentication
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "password123",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'
```

### Inventory Operations
```bash
# Add item
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Laptop Dell XPS 13",
    "sku": "DELL-XPS13-001", 
    "category": "Electronics",
    "quantity": 10,
    "price": 15000000
  }'

# Get inventory
curl -X GET http://localhost:5000/api/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Reports
```bash
# Stock opname report
curl -X GET http://localhost:5000/api/reports/stock-opname \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Export to CSV
curl -X GET http://localhost:5000/api/reports/stock-opname/export-csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o stock_report.csv
```

### Barcode Operations
```bash
# Generate barcode for item ID 1
curl -X POST http://localhost:5000/api/barcode/generate/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Scan barcode
curl -X POST http://localhost:5000/api/barcode/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "DELL-XPS13-001",
    "action": "info"
  }'
```

## Monitoring & Maintenance

### Health Checks
```bash
# Basic health check
curl http://localhost:5000/health

# Database connection check
docker-compose exec backend npm run db:check
```

### Logs
```bash
# View application logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres

# View all logs
docker-compose logs -f
```

### Database Maintenance
```bash
# Backup database
docker-compose exec postgres pg_dump -U inventory_user inventory_management > backup.sql

# Restore database
docker-compose exec -T postgres psql -U inventory_user inventory_management < backup.sql

# Run migrations
docker-compose exec backend npm run migrate
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### 2. File Permission Issues
```bash
# Fix upload directory permissions
sudo chmod -R 755 uploads/
sudo chown -R $USER:$USER uploads/
```

#### 3. Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :5000

# Kill the process or change port in .env
PORT=5001
```

#### 4. JWT Token Issues
- Ensure `JWT_SECRET` is set and at least 32 characters long
- Check token expiration with `JWT_EXPIRES_IN`

### Performance Optimization

#### Database
- Add indexes for frequently queried columns
- Use connection pooling
- Regular database maintenance

#### Application
- Enable compression middleware ✅
- Use rate limiting ✅  
- Implement caching layer
- Monitor memory usage

## Security Considerations

### Production Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Backup database regularly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting ✅
- [ ] Validate all inputs ✅

### Security Headers

The application includes security middleware:
- Helmet.js for security headers ✅
- CORS configuration ✅
- Rate limiting ✅
- Input validation ✅

## Scaling

### Horizontal Scaling
- Use load balancer (nginx) ✅
- Database connection pooling
- Redis for session management
- CDN for static files

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use caching strategies

## Support

For issues and questions:
1. Check logs first: `docker-compose logs -f`
2. Verify environment variables
3. Test database connectivity
4. Check API documentation
5. Review deployment guide

---

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   File Storage  │    │   Redis Cache   │
│   (Optional)    │    │   (uploads/)    │    │   (Optional)    │
│   Port: 80/443  │    │                 │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

The system is now ready for production deployment! 🚀
