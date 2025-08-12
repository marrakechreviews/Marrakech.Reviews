# Enhanced E-commerce Backend API

A comprehensive Node.js/Express backend API for an e-commerce platform with MongoDB database integration.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Password hashing with bcrypt
  - Password reset functionality

- **Product Management**
  - CRUD operations for products
  - Advanced filtering, sorting, and pagination
  - Full-text search capabilities
  - Category and brand management
  - Stock tracking and low stock alerts

- **Order Management**
  - Complete order processing workflow
  - Order status tracking
  - Payment integration ready (PayPal/Stripe)
  - Order history and statistics

- **Review System**
  - Product reviews and ratings
  - Review moderation (approval system)
  - Rating calculations and statistics

- **File Upload**
  - Image upload for products and user profiles
  - Multiple file upload support
  - File type and size validation

- **Admin Dashboard Support**
  - User management
  - Product management
  - Order management
  - Review moderation
  - Statistics and analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/enhanced_ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   
   # PayPal Configuration
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/search` - Search products
- `GET /api/products/top` - Get top-rated products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/stats` - Get order statistics (Admin)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/product/:productId` - Get product reviews
- `GET /api/reviews` - Get all reviews (Admin)
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PUT /api/reviews/:id/approve` - Approve/disapprove review (Admin)

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### File Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `POST /api/upload/product-images` - Upload product images (Admin)

## Database Schema

### User Model
- Authentication and profile information
- Role-based access control
- Address and contact details

### Product Model
- Complete product information
- Category and brand management
- Stock tracking and pricing
- SEO optimization fields

### Order Model
- Order items and pricing
- Shipping and payment information
- Order status tracking
- Delivery management

### Review Model
- Product reviews and ratings
- User feedback and comments
- Moderation and approval system

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- File upload restrictions

## Error Handling

Comprehensive error handling with:
- Validation errors
- Authentication errors
- Database errors
- File upload errors
- Custom error responses

## Development

The API is built with scalability and maintainability in mind:
- Modular route structure
- Middleware-based architecture
- Comprehensive validation
- Error handling middleware
- Environment-based configuration

## License

ISC

