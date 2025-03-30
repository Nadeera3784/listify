# Listify - Online Listing & Auction Platform

Listify is a modern web application that allows users to list items for sale and participate in real-time auctions.

## Features

- **User Registration & Item Listing**
  - Create an account and list items with multiple images, descriptions, and details
  - Browse listings from other users

- **Robust Search & Filter System**
  - Filter items by category
  - Search by keywords in title, description, or location

- **Live Auction System**
  - Bid on items in real-time
  - Watch the bidding process unfold with "Once, Twice, Sold!" stages
  - Track your won bids

- **Admin Dashboard**
  - Manage categories and users
  - Moderate listings

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: MongoDB, Redis, Socket.IO (for real-time updates)
- **Infrastructure**: Docker Compose

## Getting Started

1. **Prerequisites**
   - Node.js (v16+)
   - Docker & Docker Compose

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/listify.git
   cd listify

   # Install dependencies
   npm install

   # Start the database services
   docker-compose up -d

   # Start the development server
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173/
   - MongoDB: localhost:27017
   - Redis: localhost:6379

## Development

- **Run Development Server**
  ```bash
  npm run dev
  ```

- **Build for Production**
  ```bash
  npm run build
  ```

## License

[MIT License](LICENSE)
