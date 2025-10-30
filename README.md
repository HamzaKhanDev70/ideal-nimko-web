# Ideal Nimko E-commerce Website

A full-stack e-commerce website for Ideal Nimko Ltd., a snacks company specializing in traditional Indian namkeen and sweets.

## Features

### Customer Features
- **Product Catalog**: Browse products by category with filtering
- **Shopping Cart**: Add/remove items, update quantities
- **Order Placement**: Complete checkout process with customer details
- **Responsive Design**: Modern UI with Tailwind CSS
- **Real-time Updates**: Dynamic cart updates and product filtering

### Admin Features
- **Admin Dashboard**: Comprehensive overview with statistics
- **Product Management**: Full CRUD operations for products
- **Order Management**: Track and update order status
- **Analytics**: Sales reports and order statistics
- **User Authentication**: Secure admin login system
- **Bulk Operations**: Mass product updates and deletions

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- RESTful API endpoints
- CORS enabled for frontend communication
- JWT Authentication for admin
- Password hashing with bcrypt
- Advanced filtering and pagination

### Frontend
- React 19 with Vite
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Axios for API calls

## Setup Instructions

### Quick Setup (Recommended)

**Windows:**
```bash
setup-admin.bat
```

**macOS/Linux:**
```bash
chmod +x setup-admin.sh
./setup-admin.sh
```

### Manual Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

4. Seed the database with admin and sample products:
```bash
node seedAdmin.js
node seedData.js
```

5. Start the backend server:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Public Endpoints
#### Products
- `GET /api/products` - Get all products (with pagination and filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/list` - Get all categories
- Query parameters: `?category=Namkeen&featured=true&search=term&page=1&limit=10`

#### Orders
- `POST /api/orders` - Create new order

### Admin Endpoints (Protected)
#### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/change-password` - Change password

#### Products (Admin)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `DELETE /api/products` - Bulk delete products

#### Orders (Admin)
- `GET /api/orders` - Get all orders (with filtering and pagination)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id` - Update order details
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/stats/dashboard` - Get dashboard statistics

## Project Structure

```
ideal-nimko-website/
├── api/                    # Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js          # Express server
│   ├── seedData.js        # Database seeding
│   └── package.json
├── app/                   # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client
│   │   └── App.jsx        # Main app component
│   └── package.json
└── README.md
```

## Usage

### Customer Usage
1. **Browse Products**: Visit the homepage to see featured products or go to the products page to see all items
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Click the cart icon in the navigation to see your items
4. **Checkout**: Click "Proceed to Checkout" to place an order
5. **Order Confirmation**: Fill in your details and place the order

### Admin Usage
1. **Access Admin Panel**: Go to `http://localhost:5173/admin`
2. **Login**: Use credentials `admin@idealnimko.com` / `admin123`
3. **Dashboard**: View sales statistics and recent orders
4. **Product Management**: Add, edit, delete products with full CRUD operations
5. **Order Management**: Track orders, update status, view customer details
6. **Analytics**: Monitor sales performance and order trends

## Sample Data

The database is seeded with sample products including:
- Namkeen (Spicy Bhujia, Classic Namkeen Mix, Spicy Chana)
- Sweet Snacks (Sweet Mathri, Coconut Ladoo, Almond Brittle)
- Nuts (Masala Peanuts, Mixed Nuts)
- Traditional sweets (Tamarind Candy, Sesame Chikki)

## Development

### Adding New Products
1. Use the seedData.js file as a template
2. Add new products to the sampleProducts array
3. Run `node seedData.js` to update the database

### Customizing Styling
- All styling is done with Tailwind CSS
- Modify `app/src/index.css` for global styles
- Component-specific styles are in the JSX files

## Production Deployment

### Backend
1. Set environment variables (MONGO_URI, PORT)
2. Use PM2 or similar process manager
3. Configure reverse proxy (Nginx)

### Frontend
1. Build the project: `npm run build`
2. Serve static files with a web server
3. Configure API URL for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. All rights reserved.
