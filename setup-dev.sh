#!/bin/bash

# CloudBit ISP Inventory System - Development Setup Script
echo "=== CloudBit ISP Inventory System - Development Setup ==="
echo ""

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "❌ File .env tidak ditemukan di folder backend"
    echo "📋 Membuat file .env dari template..."
    cp backend/.env.example backend/.env
    echo "✅ File .env berhasil dibuat"
    echo "⚠️  Silakan edit backend/.env untuk konfigurasi database dan JWT secret"
    echo ""
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Gagal install dependencies backend"
    exit 1
fi
echo "✅ Backend dependencies berhasil diinstall"
echo ""

# Run database migrations
echo "🗄️  Menjalankan database migrations..."
npm run migrate
if [ $? -ne 0 ]; then
    echo "❌ Gagal menjalankan migrations"
    echo "⚠️  Pastikan database PostgreSQL sudah berjalan dan konfigurasi .env benar"
    exit 1
fi
echo "✅ Database migrations berhasil"
echo ""

# Run database seeders
echo "🌱 Menjalankan database seeders..."
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ Gagal menjalankan seeders"
    exit 1
fi
echo "✅ Database seeders berhasil"
echo ""

# Check if frontend folder exists
if [ -d "../frontend" ]; then
    echo "📦 Installing frontend dependencies..."
    cd ../frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Gagal install dependencies frontend"
        exit 1
    fi
    echo "✅ Frontend dependencies berhasil diinstall"
    cd ../backend
else
    echo "ℹ️  Frontend folder tidak ditemukan, skip frontend setup"
fi

echo ""
echo "🎉 Development setup selesai!"
echo ""
echo "Untuk menjalankan aplikasi:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "API Documentation akan tersedia di: http://localhost:3000/health"
echo "Database sudah terisi dengan data sample categories dan suppliers"
echo ""
echo "Default admin user:"
echo "  Email: admin@cloudbit.com"
echo "  Password: admin123"
echo ""
