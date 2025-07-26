# Docker Deployment Guide - ISP Inventory App

## Prerequisites

- Docker dan Docker Compose terinstall
- Git untuk clone repository
- Port 3000, 5432, 6379, dan 80 tersedia

## Quick Start

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd isp-inventory-app
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env sesuai kebutuhan
   ```

3. **Start aplikasi:**
   ```bash
   docker-compose up -d
   ```

4. **Tunggu semua service ready:**
   ```bash
   docker-compose logs -f
   ```

5. **Akses aplikasi:**
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Services

### Backend API (Port 3000)
- Node.js + Express + TypeScript
- Barcode/QR Code scanning & printing
- File upload & S3 integration
- Role-based authentication

### PostgreSQL Database (Port 5432)
- Data inventori, users, transactions
- Auto migrations on startup

### Redis Cache (Port 6379)
- Session storage
- Caching

### Nginx Proxy (Port 80) - Optional
- Reverse proxy
- Load balancing
- SSL termination

## Environment Variables

Konfigurasi utama di file `.env`:

```bash
# Database
DB_USER=inventory_user
DB_PASSWORD=inventory_password
DB_NAME=isp_inventory

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# S3 Storage (Optional)
STORAGE_MODE=local  # atau 's3'
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_S3_BUCKET=your_bucket
# AWS_S3_ENDPOINT=https://is3.cloudhost.id
```

## Commands

### Development
```bash
# Start dengan logs
docker-compose up

# Start background
docker-compose up -d

# Rebuild services
docker-compose up --build

# View logs
docker-compose logs -f backend
```

### Maintenance
```bash
# Stop semua services
docker-compose down

# Stop + hapus volumes (HATI-HATI!)
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Execute command dalam container
docker-compose exec backend npm run migrate:latest
```

### Database
```bash
# Run migrations
docker-compose exec backend npm run migrate:latest

# Rollback migration
docker-compose exec backend npm run migrate:rollback

# Seed data
docker-compose exec backend npm run seed:run

# Database backup
docker-compose exec postgres pg_dump -U inventory_user isp_inventory > backup.sql
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register user baru

### Barcode/QR Code
- `POST /barcode/scan` - Scan barcode/QR
- `GET /barcode/item/:code` - Get item by code
- `POST /barcode/generate/qr/:itemId` - Generate QR code
- `POST /barcode/generate/barcode/:itemId` - Generate barcode
- `POST /barcode/sticker/:itemId` - Generate sticker
- `POST /barcode/create-from-barcode` - Create inventory dari barcode
- `POST /barcode/bulk-import` - Bulk import dari list barcode

### Inventory
- `GET /inventory` - List semua inventory
- `POST /inventory` - Create inventory baru
- `PUT /inventory/:id` - Update inventory
- `DELETE /inventory/:id` - Delete inventory

## Troubleshooting

### Service tidak start
```bash
docker-compose logs <service-name>
```

### Database connection error
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U inventory_user

# Check database
docker-compose exec postgres psql -U inventory_user -d isp_inventory -c "\\dt"
```

### File permission issues
```bash
# Fix ownership
sudo chown -R $USER:$USER ./uploads
chmod -R 755 ./uploads
```

### Port conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000

# Change ports in .env
BACKEND_PORT=3001
DB_PORT=5433
```

## Production Notes

1. **Security:**
   - Ganti JWT_SECRET dengan nilai random yang kuat
   - Gunakan password database yang kompleks
   - Setup firewall untuk protect database ports

2. **Backup:**
   - Setup automated database backup
   - Backup volume uploads secara berkala

3. **Monitoring:**
   - Monitor logs: `docker-compose logs -f`
   - Health checks: `curl http://localhost:3000/health`

4. **Performance:**
   - Adjust memory limits di docker-compose.yml
   - Monitor resource usage dengan `docker stats`

## Support

Untuk issues atau pertanyaan, silakan buka issue di repository GitHub.
