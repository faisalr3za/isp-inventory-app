#!/bin/bash

# CloudBit ISP Inventory App - Deployment Verification Script
# Internet Cepat & Stabil #pilihCloudBit
# This script checks if the application is properly deployed and configured

echo "=========================================================="
echo "  CloudBit ISP Inventory App - Deployment Verification"
echo "  Internet Cepat & Stabil #pilihCloudBit"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $3${NC}"
    fi
}

# CloudBit Banner
echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║          CloudBit.net.id                  ║"
echo "  ║    Internet Cepat & Stabil untuk semua    ║"
echo "  ║         WhatsApp: +62 856-2467-9994      ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check system requirements
echo -e "${BLUE}1. Checking System Requirements...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "${GREEN}✅ Node.js: $node_version${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
fi

# Check npm
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo -e "${GREEN}✅ npm: $npm_version${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    psql_version=$(psql --version | head -1)
    echo -e "${GREEN}✅ PostgreSQL: $psql_version${NC}"
else
    echo -e "${RED}❌ PostgreSQL not found${NC}"
fi

# Check Docker
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo -e "${GREEN}✅ Docker: $docker_version${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Docker not found (optional)${NC}"
    DOCKER_AVAILABLE=false
fi

echo ""

# Check project structure
echo -e "${BLUE}2. Checking CloudBit Project Structure...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Not in CloudBit project root directory${NC}"
    echo "Please run this script from the CloudBit project root directory"
    exit 1
fi

# Check essential files
[ -f "docker-compose.yml" ] && echo -e "${GREEN}✅ docker-compose.yml found${NC}" || echo -e "${YELLOW}⚠️  docker-compose.yml not found${NC}"
[ -f ".env.example" ] && echo -e "${GREEN}✅ .env.example found${NC}" || echo -e "${RED}❌ .env.example not found${NC}"
[ -f "backend/package.json" ] && echo -e "${GREEN}✅ CloudBit Backend package.json found${NC}" || echo -e "${RED}❌ Backend package.json not found${NC}"
[ -f "frontend/package.json" ] && echo -e "${GREEN}✅ CloudBit Frontend package.json found${NC}" || echo -e "${RED}❌ Frontend package.json not found${NC}"

echo ""

# Check environment configuration
echo -e "${BLUE}3. Checking CloudBit Environment Configuration...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    # Check critical environment variables
    if grep -q "JWT_SECRET" .env; then
        echo -e "${GREEN}✅ JWT_SECRET configured${NC}"
    else
        echo -e "${RED}❌ JWT_SECRET not configured${NC}"
    fi
    
    if grep -q "DB_PASSWORD" .env; then
        echo -e "${GREEN}✅ DB_PASSWORD configured${NC}"
    else
        echo -e "${RED}❌ DB_PASSWORD not configured${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Run: cp .env.example .env"
fi

echo ""

# Check if services are running
echo -e "${BLUE}4. Checking CloudBit Services Status...${NC}"

# Check if Docker containers are running
if [ "$DOCKER_AVAILABLE" = true ] && [ -f "docker-compose.yml" ]; then
    echo "Checking Docker containers..."
    if docker compose ps --services --filter "status=running" &> /dev/null; then
        running_services=$(docker compose ps --services --filter "status=running" 2>/dev/null)
        if [ -n "$running_services" ]; then
            echo -e "${GREEN}✅ CloudBit Docker services are running:${NC}"
            echo "$running_services" | sed 's/^/   /'
        else
            echo -e "${YELLOW}⚠️  No CloudBit Docker services running${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  CloudBit Docker Compose project not found${NC}"
    fi
fi

# Check ports
echo "Checking CloudBit application ports..."

# Backend port (3000)
if ss -tlnp | grep -q ":3000 "; then
    echo -e "${GREEN}✅ CloudBit Backend port 3000 is active${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  CloudBit Backend port 3000 not in use${NC}"
    BACKEND_RUNNING=false
fi

# Frontend port (5173)
if ss -tlnp | grep -q ":5173 "; then
    echo -e "${GREEN}✅ CloudBit Frontend port 5173 is active${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  CloudBit Frontend port 5173 not in use${NC}"
    FRONTEND_RUNNING=false
fi

# Database port (5432)
if ss -tlnp | grep -q ":5432 "; then
    echo -e "${GREEN}✅ Database port 5432 is active${NC}"
    DATABASE_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Database port 5432 not in use${NC}"
    DATABASE_RUNNING=false
fi

echo ""

# Test API endpoints
echo -e "${BLUE}5. Testing CloudBit API Endpoints...${NC}"

if [ "$BACKEND_RUNNING" = true ]; then
    # Test health endpoint
    echo "Testing CloudBit backend health endpoint..."
    if curl -s -f "http://localhost:3000/health" &> /dev/null; then
        echo -e "${GREEN}✅ CloudBit Backend health check passed${NC}"
        health_response=$(curl -s "http://localhost:3000/health" | head -c 100)
        echo "   Response: $health_response"
    else
        echo -e "${RED}❌ CloudBit Backend health check failed${NC}"
    fi
    
    # Test API root
    echo "Testing CloudBit API root endpoint..."
    api_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api" 2>/dev/null)
    if [ "$api_status" = "200" ] || [ "$api_status" = "404" ]; then
        echo -e "${GREEN}✅ CloudBit API endpoint accessible (HTTP $api_status)${NC}"
    else
        echo -e "${RED}❌ CloudBit API endpoint not accessible${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  CloudBit Backend not running, skipping API tests${NC}"
fi

if [ "$FRONTEND_RUNNING" = true ]; then
    echo "Testing CloudBit frontend..."
    frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173" 2>/dev/null)
    if [ "$frontend_status" = "200" ]; then
        echo -e "${GREEN}✅ CloudBit Frontend accessible (HTTP $frontend_status)${NC}"
    else
        echo -e "${RED}❌ CloudBit Frontend not accessible (HTTP $frontend_status)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  CloudBit Frontend not running, skipping frontend test${NC}"
fi

echo ""

# Check database connectivity
echo -e "${BLUE}6. Testing CloudBit Database Connectivity...${NC}"

if [ "$DATABASE_RUNNING" = true ]; then
    # Try to connect to database
    if [ -f ".env" ]; then
        # Source environment variables
        export $(grep -v '^#' .env | xargs)
        
        echo "Testing CloudBit database connection..."
        if pg_isready -h localhost -p ${DB_PORT:-5432} -U ${DB_USER:-inventory_user} &> /dev/null; then
            echo -e "${GREEN}✅ CloudBit Database connection successful${NC}"
            
            # Test if database exists
            if PGPASSWORD=${DB_PASSWORD} psql -h localhost -p ${DB_PORT:-5432} -U ${DB_USER:-inventory_user} -d ${DB_NAME:-isp_inventory} -c "SELECT version();" &> /dev/null; then
                echo -e "${GREEN}✅ CloudBit Database query successful${NC}"
            else
                echo -e "${RED}❌ CloudBit Database query failed${NC}"
            fi
        else
            echo -e "${RED}❌ CloudBit Database connection failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No .env file found, skipping database test${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Database not running, skipping database test${NC}"
fi

echo ""

# Summary and recommendations
echo -e "${BLUE}7. CloudBit Deployment Summary...${NC}"
echo "=========================================================="

if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ] && [ "$DATABASE_RUNNING" = true ]; then
    echo -e "${GREEN}🎉 CloudBit ISP Inventory App is fully deployed and running!${NC}"
    echo -e "${GREEN}   Internet Cepat & Stabil #pilihCloudBit${NC}"
    echo ""
    echo "Access URLs:"
    echo "  • CloudBit Frontend: http://localhost:5173"
    echo "  • CloudBit Backend API: http://localhost:3000"
    echo "  • Health Check: http://localhost:3000/health"
    echo ""
    echo "Default credentials:"
    echo "  • Admin: admin@company.com / admin123"
    echo "  • Manager: manager@company.com / manager123"
    echo "  • Staff: staff@company.com / staff123"
else
    echo -e "${YELLOW}⚠️  CloudBit application is partially deployed or not running${NC}"
    echo ""
    echo "To start the CloudBit application:"
    echo ""
    if [ "$DOCKER_AVAILABLE" = true ] && [ -f "docker-compose.yml" ]; then
        echo "Docker method (recommended):"
        echo "  docker compose up -d"
        echo ""
    fi
    echo "Manual method:"
    echo "  1. Backend: cd backend && npm install && npm run build && npm start"
    echo "  2. Frontend: cd frontend && npm install && npm run build && npm run preview"
    echo ""
fi

# Final checklist
echo "CloudBit Deployment Checklist:"
echo "  • Node.js installed: $([ -n "$(command -v node)" ] && echo "✅" || echo "❌")"
echo "  • PostgreSQL installed: $([ -n "$(command -v psql)" ] && echo "✅" || echo "❌")"
echo "  • Environment configured: $([ -f ".env" ] && echo "✅" || echo "❌")"
echo "  • Backend running: $([ "$BACKEND_RUNNING" = true ] && echo "✅" || echo "❌")"
echo "  • Frontend running: $([ "$FRONTEND_RUNNING" = true ] && echo "✅" || echo "❌")"
echo "  • Database running: $([ "$DATABASE_RUNNING" = true ] && echo "✅" || echo "❌")"

echo ""
echo -e "${CYAN}=========================================================="
echo "CloudBit.net.id - Internet Cepat & Stabil #pilihCloudBit"
echo "WhatsApp: +62 856-2467-9994"
echo "Verification completed at $(date)"
echo -e "==========================================================${NC}"
