# Listify - Modern Marketplace & Auction Platform

Listify is a full-stack web application that combines traditional marketplace listings with a dynamic real-time auction system. Built with React, TypeScript, Node.js, Express, MongoDB, and Redis, it provides a robust platform for users to buy, sell, and bid on items.


## Features

### User Authentication & Authorization
- Secure user registration and login
- JWT-based authentication
- Role-based access control (User/Admin)
- Protected routes

### Listings
- Create, view, edit, and delete listings
- Image uploads with multiple files support
- Categorization of listings
- Advanced search and filtering
- My Listings section

### Auction System
- Real-time auction bidding using Socket.IO
- Live bid updates and countdowns
- Auction status management (Scheduled, Live, Going Once, Going Twice, Sold)
- Automatic completion of auctions
- Phone number validation for auction owners
- Image uploads for auction items

### Admin Dashboard
- User management
- Category management
- Content moderation tools

### User Interface
- Responsive design for all devices
- Modern, professional UI with Tailwind CSS
- Intuitive navigation and layout

### Performance & Scalability
- Redis caching for improved performance
- Optimized database queries
- Efficient image storage and delivery

## Project Structure

```
listify/
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   └── src/                  # Source code
│       ├── components/       # React components
│       ├── context/          # Context API
│       ├── hooks/            # Custom hooks
│       ├── pages/            # Page components
│       ├── services/         # API services
│       ├── types/            # TypeScript types
│       └── utils/            # Utility functions
│
├── backend/                  # Node.js backend
│   ├── src/                  # Source code
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   └── uploads/              # Uploaded files
│
└── README.md                 # Project documentation
```

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- Redis (v6+)
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/listify
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:5173
   UPLOADS_DIR=./uploads
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. Create the uploads directory:
   ```bash
   mkdir -p uploads/listings uploads/auctions
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5001/api
   VITE_SOCKET_URL=http://localhost:5001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at: 
   ```
   http://localhost:5173
   ```

## Deployment

### Frontend Deployment
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the generated `dist` directory to your web server or hosting service.

### Backend Deployment
1. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Technologies

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- Redis
- Socket.IO
- JWT Authentication
- Multer (file uploads)


## License

This project is licensed under the MIT License - see the LICENSE file for details.


## Acknowledgements

- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)
