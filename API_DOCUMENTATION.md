# API Documentation - Inventory Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT authentication token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Responses
All endpoints follow this error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "admin" | "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

### POST /auth/login
Login user and get JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

---

## Inventory Items Endpoints

### GET /inventory
Get all inventory items with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or SKU
- `category` (optional): Filter by category
- `location` (optional): Filter by location

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "number",
        "name": "string",
        "sku": "string",
        "description": "string",
        "category": "string",
        "location": "string",
        "quantity": "number",
        "unit": "string",
        "price": "number",
        "min_stock": "number",
        "barcode_path": "string",
        "qr_code_path": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ],
    "pagination": {
      "current_page": "number",
      "total_pages": "number",
      "total_items": "number",
      "per_page": "number"
    }
  }
}
```

### GET /inventory/:id
Get single inventory item by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "name": "string",
    "sku": "string",
    "description": "string",
    "category": "string",
    "location": "string",
    "quantity": "number",
    "unit": "string",
    "price": "number",
    "min_stock": "number",
    "barcode_path": "string",
    "qr_code_path": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

### POST /inventory
Create new inventory item.

**Request Body:**
```json
{
  "name": "string",
  "sku": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "quantity": "number",
  "unit": "string",
  "price": "number",
  "min_stock": "number"
}
```

### PUT /inventory/:id
Update inventory item.

**Request Body:** Same as POST /inventory

### DELETE /inventory/:id
Delete inventory item.

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## Stock Movement Endpoints

### GET /stock-movements
Get all stock movements with pagination.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `item_id` (optional): Filter by item ID
- `type` (optional): Filter by movement type (in/out/adjustment)
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "movements": [
      {
        "id": "number",
        "item_id": "number",
        "type": "in" | "out" | "adjustment",
        "quantity": "number",
        "reference": "string",
        "notes": "string",
        "created_by": "number",
        "created_at": "datetime",
        "item": {
          "name": "string",
          "sku": "string"
        },
        "user": {
          "username": "string"
        }
      }
    ],
    "pagination": {
      "current_page": "number",
      "total_pages": "number",
      "total_items": "number",
      "per_page": "number"
    }
  }
}
```

### POST /stock-movements
Create new stock movement.

**Request Body:**
```json
{
  "item_id": "number",
  "type": "in" | "out" | "adjustment",
  "quantity": "number",
  "reference": "string",
  "notes": "string"
}
```

---

## Barcode & QR Code Endpoints

### POST /barcode/generate/:itemId
Generate barcode and QR code for an item.

**Response:**
```json
{
  "success": true,
  "message": "Barcode and QR code generated successfully",
  "data": {
    "barcode_path": "string",
    "qr_code_path": "string"
  }
}
```

### POST /barcode/scan
Scan barcode or QR code to get item information.

**Request Body:**
```json
{
  "code": "string",
  "action": "stock_in" | "stock_out" | "info"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "number",
      "name": "string",
      "sku": "string",
      "quantity": "number",
      "unit": "string"
    },
    "action": "string"
  }
}
```

### GET /barcode/sticker/:itemId
Download printable sticker for an item.

**Response:** PDF file download

### GET /barcode/download/:itemId/:type
Download barcode or QR code image.

**Parameters:**
- `itemId`: Item ID
- `type`: "barcode" or "qrcode"

**Response:** Image file download

---

## Reports Endpoints

### GET /reports/stock-opname
Get stock opname report.

**Query Parameters:**
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `date` (optional): Report date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "report_date": "string",
    "items": [
      {
        "id": "number",
        "name": "string",
        "sku": "string",
        "category": "string",
        "location": "string",
        "current_stock": "number",
        "min_stock": "number",
        "unit": "string",
        "status": "normal" | "low_stock" | "out_of_stock",
        "last_movement": "datetime"
      }
    ],
    "summary": {
      "total_items": "number",
      "low_stock_items": "number",
      "out_of_stock_items": "number",
      "total_value": "number"
    }
  }
}
```

### GET /reports/stock-opname/export-csv
Export stock opname report to CSV.

**Query Parameters:** Same as GET /reports/stock-opname

**Response:** CSV file download

### GET /reports/stock-variance
Get stock variance report.

**Query Parameters:**
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "variances": [
      {
        "item_id": "number",
        "item_name": "string",
        "sku": "string",
        "expected_stock": "number",
        "actual_stock": "number",
        "variance": "number",
        "variance_percentage": "number",
        "variance_value": "number"
      }
    ],
    "summary": {
      "total_variance_value": "number",
      "items_with_variance": "number"
    }
  }
}
```

### POST /reports/calculate-variance
Calculate stock variance for specific items.

**Request Body:**
```json
{
  "items": [
    {
      "item_id": "number",
      "actual_count": "number"
    }
  ]
}
```

### GET /reports/monthly-movements
Get monthly movement report.

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month (1-12, default: current month)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "string",
    "movements": [
      {
        "item_id": "number",
        "item_name": "string",
        "sku": "string",
        "total_in": "number",
        "total_out": "number",
        "net_movement": "number",
        "movement_count": "number"
      }
    ],
    "summary": {
      "total_movements": "number",
      "total_items_affected": "number",
      "total_in": "number",
      "total_out": "number"
    }
  }
}
```

### GET /reports/analytics
Get analytics dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_items": "number",
      "total_categories": "number",
      "low_stock_alerts": "number",
      "total_inventory_value": "number"
    },
    "recent_movements": [
      {
        "id": "number",
        "item_name": "string",
        "type": "string",
        "quantity": "number",
        "created_at": "datetime"
      }
    ],
    "top_moving_items": [
      {
        "item_id": "number",
        "item_name": "string",
        "total_movements": "number"
      }
    ],
    "category_distribution": [
      {
        "category": "string",
        "item_count": "number",
        "total_value": "number"
      }
    ]
  }
}
```

### GET /reports/stock-aging
Get stock aging report.

**Response:**
```json
{
  "success": true,
  "data": {
    "aging_analysis": [
      {
        "item_id": "number",
        "item_name": "string",
        "sku": "string",
        "last_movement_date": "datetime",
        "days_since_last_movement": "number",
        "current_stock": "number",
        "aging_category": "fast_moving" | "slow_moving" | "dead_stock"
      }
    ],
    "summary": {
      "fast_moving_items": "number",
      "slow_moving_items": "number",
      "dead_stock_items": "number"
    }
  }
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Usage

### 1. Register and Login
```bash
# Register
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

### 2. Add Inventory Item
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Laptop Dell XPS 13",
    "sku": "DELL-XPS13-001",
    "description": "13-inch ultrabook laptop",
    "category": "Electronics",
    "location": "Warehouse A",
    "quantity": 10,
    "unit": "pcs",
    "price": 15000000,
    "min_stock": 2
  }'
```

### 3. Generate Barcode
```bash
curl -X POST http://localhost:5000/api/barcode/generate/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Stock Opname Report
```bash
curl -X GET "http://localhost:5000/api/reports/stock-opname?category=Electronics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Deployment Notes

1. Set environment variables in production:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=your_strong_secret`
   - Database connection details

2. Ensure upload directories exist:
   - `uploads/barcodes/`
   - `uploads/qrcodes/`
   - `uploads/stickers/`

3. Install all dependencies:
   ```bash
   npm install
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start the application:
   ```bash
   npm start
   ```
